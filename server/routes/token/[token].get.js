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
 * 1. Menghasilkan Content-Disposition yang 100% aman (RFC 6266 & RFC 5987)
 * Mendukung karakter 'ø', kanji, arab, emoji, simbol, kutip ganda, dll.
 */
function formatContentDisposition(filename) {
   if (!filename || typeof filename !== 'string') return 'attachment'

   // Decode terlebih dahulu jika input sebelumnya sudah ter-encode (mencegah double encoding)
   let cleanName = filename
   try {
      cleanName = decodeURIComponent(filename)
   } catch { }

   // Bersihkan newline (\r, \n)
   cleanName = cleanName.replace(/[\r\n]/g, '').trim()

   // A. Fallback ASCII murni (Karakter di luar ASCII 32-126 seperti 'ø' diganti '_')
   const asciiFallback = cleanName
      .replace(/["\\]/g, '')
      .replace(/[^\x20-\x7E]/g, '_') || 'download'

   // B. UTF-8 RFC 5987 Percent-Encoding (Semua karakter non-ASCII diubah ke format %XX)
   const encodedUtf8 = encodeURIComponent(cleanName)
      .replace(/['()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
      .replace(/\*/g, '%2A')

   return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedUtf8}`
}

/**
 * 2. Memastikan Target URL valid & aman untuk fungsi fetch()
 */
function safeTargetUrl(urlStr) {
   try {
      return new URL(urlStr).href
   } catch {
      return encodeURI(urlStr)
   }
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

      // Amankan forward custom headers
      const forwardHeaders = new Headers()
      if (record.custom_headers) {
         try {
            const parsed = typeof record.custom_headers === 'string'
               ? JSON.parse(record.custom_headers)
               : record.custom_headers

            for (const [k, v] of Object.entries(parsed)) {
               try {
                  // Pastikan nilai header aman (ASCII only)
                  const safeVal = String(v).replace(/[^\x20-\x7E]/g, '')
                  forwardHeaders.set(k, safeVal)
               } catch { }
            }
         } catch (e) { }
      }

      const incomingHeaders = event.node?.req?.headers
         || Object.fromEntries(new Headers(event.web?.request?.headers))
      if (incomingHeaders.range) {
         forwardHeaders.set('Range', incomingHeaders.range)
      }

      // Pastikan target URL di-encode dengan benar sebelum fetch
      const targetUrl = safeTargetUrl(record.target_url)
      const upstreamRes = await fetch(targetUrl, { headers: forwardHeaders })

      if (!upstreamRes.ok && upstreamRes.status !== 206) {
         return new Response(`Failed fetching remote file: ${upstreamRes.status}`, { status: 502 })
      }

      const contentLength = parseInt(upstreamRes.headers.get('content-length') || '0', 10)
      if (contentLength > record.max_bytes) {
         return new Response('File size exceeds allowed signed limit', { status: 413 })
      }

      event.waitUntil(recordCdnDownload(db, token, contentLength))

      // Sanitasi header dari upstream agar karakter ilegal tidak membuat response crash
      const outHeaders = new Headers()
      for (const [key, value] of upstreamRes.headers.entries()) {
         const lowerKey = key.toLowerCase()
         // Hapus header transfer dan timpa content-disposition bawaan upstream
         if (['content-encoding', 'content-length', 'transfer-encoding', 'content-disposition'].includes(lowerKey)) {
            continue
         }
         try {
            // Encode karakter non-ASCII jika ada header upstream yang tidak standar
            const safeVal = value.replace(/[^\x20-\x7E]/g, (char) => encodeURIComponent(char))
            outHeaders.set(key, safeVal)
         } catch { }
      }

      outHeaders.set('Access-Control-Allow-Origin', '*')

      // Set Content-Disposition yang sudah aman
      if (record.filename) {
         outHeaders.set('Content-Disposition', formatContentDisposition(record.filename))
      }

      return new Response(upstreamRes.body, {
         status: upstreamRes.status,
         headers: outHeaders
      })

   } catch (err) {
      console.error('[CDN Worker Error]:', err)
      return new Response(`Error: ${err.message}`, { status: 500 })
   }
})