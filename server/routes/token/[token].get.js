import { getCloudflareEnv } from '../../utils/index.js'
import { getSignedCdn, recordCdnDownload, cleanExpiredCdn } from '../../utils/database.js'

function isDomainAllowed(domain, allowedPatternsStr) {
   if (!allowedPatternsStr) return true
   const patterns = allowedPatternsStr.split(',').map(s => s.trim().toLowerCase())
   const targetDomain = domain.toLowerCase()

   return patterns.some(pattern => {
      if (pattern.startsWith('*.')) {
         const baseDomain = pattern.slice(2)
         return targetDomain === baseDomain || targetDomain.endsWith('.' + baseDomain)
      }
      return targetDomain === pattern
   })
}

/**
 * Helper untuk format Content-Disposition agar support semua karakter (UTF-8, Simbol, Emoji, Spasi)
 */
function formatContentDisposition(filename) {
   if (!filename) return 'attachment'

   // 1. Fallback ASCII aman: Ganti karakter non-ASCII dan kutip ganda agar tidak crash di HTTP header
   const asciiFallback = filename
      .replace(/[\r\n"]/g, '_')
      .replace(/[^\x20-\x7E]/g, '_')

   // 2. RFC 5987 / RFC 6266 UTF-8 encoding (Support semua karakter)
   const utf8Filename = encodeURIComponent(filename)
      .replace(/['()]/g, escape)
      .replace(/\*/g, '%2A')

   return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${utf8Filename}`
}

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const params = event.context.params || {}
   const token = params.token
   const db = env.DB

   const url = new URL(event.node?.req?.url || event.web?.request?.url, 'http://localhost')
   const requestedDomain = url.searchParams.get('domain') || ''

   try {
      const allowedConfig = env.ALLOWED_CDN_DOMAINS || 'neoxr.eu, *.neoxr.eu'
      if (!requestedDomain || !isDomainAllowed(requestedDomain, allowedConfig)) {
         return new Response(`Domain '${requestedDomain}' is not authorized for signed CDN.`, { status: 403 })
      }

      const record = await getSignedCdn(db, token)
      if (!record) return new Response('Invalid or unknown CDN token', { status: 404 })

      const nowInSeconds = Math.floor(Date.now() / 1000)
      const expiredAt = record.expired_at > 1e11 ? Math.floor(record.expired_at / 1000) : record.expired_at

      if (nowInSeconds > expiredAt) {
         event.waitUntil(cleanExpiredCdn(db))
         return new Response('CDN link has expired', { status: 410 })
      }

      const forwardHeaders = new Headers()
      if (record.custom_headers) {
         try {
            const parsed = JSON.parse(record.custom_headers)
            for (const [k, v] of Object.entries(parsed)) forwardHeaders.set(k, v)
         } catch (e) { }
      }

      const incomingHeaders = event.node?.req?.headers
         || Object.fromEntries(new Headers(event.web?.request?.headers))
      if (incomingHeaders.range) {
         forwardHeaders.set('Range', incomingHeaders.range)
      }

      const upstreamRes = await fetch(record.target_url, { headers: forwardHeaders })
      if (!upstreamRes.ok && upstreamRes.status !== 206) {
         return new Response(`Failed fetching remote file: ${upstreamRes.status}`, { status: 502 })
      }

      const contentLength = parseInt(upstreamRes.headers.get('content-length') || '0', 10)
      if (contentLength > record.max_bytes) {
         return new Response('File size exceeds allowed signed limit', { status: 413 })
      }

      event.waitUntil(recordCdnDownload(db, token, contentLength))

      const outHeaders = new Headers(upstreamRes.headers)
      outHeaders.set('Access-Control-Allow-Origin', '*')

      outHeaders.delete('content-encoding')
      outHeaders.delete('content-length')
      outHeaders.delete('transfer-encoding')

      // PERBAIKAN DI SINI:
      if (record.filename) {
         outHeaders.set('Content-Disposition', formatContentDisposition(record.filename))
      }

      return new Response(upstreamRes.body, {
         status: upstreamRes.status, // preserves 206 for range requests
         headers: outHeaders
      })

   } catch (err) {
      return new Response(err.message, { status: 500 })
   }
})