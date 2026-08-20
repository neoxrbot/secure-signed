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
 * Support semua karakter di filename (UTF-8, simbol, ø, kanji, emoji, dll.)
 */
function formatContentDisposition(filename, inline = false) {
   if (!filename || typeof filename !== 'string') return inline ? 'inline' : 'attachment'

   let cleanName = filename
   try { cleanName = decodeURIComponent(filename) } catch { }
   cleanName = cleanName.replace(/[\r\n]/g, '').trim()

   const asciiFallback = cleanName
      .replace(/["\\]/g, '')
      .replace(/[^\x20-\x7E]/g, '_') || 'file'

   const encodedUtf8 = encodeURIComponent(cleanName)
      .replace(/['()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
      .replace(/\*/g, '%2A')

   const type = inline ? 'inline' : 'attachment'
   return `${type}; filename="${asciiFallback}"; filename*=UTF-8''${encodedUtf8}`
}

function safeTargetUrl(urlStr) {
   try {
      return new URL(urlStr).href
   } catch {
      return encodeURI(urlStr)
   }
}

/**
 * Helper pembaca header client yang kompatibel di semua runtime (Nuxt, Nitro, Cloudflare)
 */
function getClientHeader(event, headerName) {
   try {
      if (typeof getRequestHeader === 'function') {
         const val = getRequestHeader(event, headerName)
         if (val) return val
      }
      if (typeof getHeader === 'function') {
         const val = getHeader(event, headerName)
         if (val) return val
      }
   } catch { }

   const lower = headerName.toLowerCase()
   if (event.node?.req?.headers) {
      return event.node.req.headers[lower] || event.node.req.headers[headerName]
   }
   if (event.web?.request?.headers?.get) {
      return event.web.request.headers.get(headerName)
   }
   if (event.request?.headers?.get) {
      return event.request.headers.get(headerName)
   }
   return null
}

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const params = event.context.params || {}
   const token = params.token
   const db = env.DB

   const url = new URL(event.node?.req?.url || event.web?.request?.url, 'http://localhost')
   const requestedDomain = url.searchParams.get('domain') || ''
   const isInline = url.searchParams.get('inline') === 'true' || url.searchParams.has('play')

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

      // 1. Custom headers dari database
      if (record.custom_headers) {
         try {
            const parsed = typeof record.custom_headers === 'string'
               ? JSON.parse(record.custom_headers)
               : record.custom_headers
            for (const [k, v] of Object.entries(parsed)) {
               try {
                  forwardHeaders.set(k, String(v).replace(/[^\x20-\x7E]/g, ''))
               } catch { }
            }
         } catch (e) { }
      }

      // 2. Forward Header Penting untuk Streaming Video (Range, If-Range, User-Agent)
      const rangeHeader = getClientHeader(event, 'range')
      if (rangeHeader) {
         forwardHeaders.set('Range', rangeHeader)
      }

      const ifRangeHeader = getClientHeader(event, 'if-range')
      if (ifRangeHeader) {
         forwardHeaders.set('If-Range', ifRangeHeader)
      }

      const userAgent = getClientHeader(event, 'user-agent')
      if (userAgent) {
         forwardHeaders.set('User-Agent', userAgent)
      }

      // 3. Fetch ke upstream
      const targetUrl = safeTargetUrl(record.target_url)
      const upstreamRes = await fetch(targetUrl, {
         headers: forwardHeaders,
         method: event.node?.req?.method || 'GET'
      })

      // Dukung status 200 (OK), 206 (Partial Video), 304 (Cache), 416 (Range Satisfiable)
      const validStatuses = [200, 206, 304, 416]
      if (!upstreamRes.ok && !validStatuses.includes(upstreamRes.status)) {
         return new Response(`Failed fetching remote file: ${upstreamRes.status}`, { status: 502 })
      }

      const contentLength = parseInt(upstreamRes.headers.get('content-length') || '0', 10)
      if (upstreamRes.status === 200 && contentLength > record.max_bytes) {
         return new Response('File size exceeds allowed signed limit', { status: 413 })
      }

      // 4. Catat download hanya pada full download / chunk pertama agar TIDAK membebani database
      event.waitUntil((async () => {
         try {
            const isFirstChunk = !rangeHeader || rangeHeader.startsWith('bytes=0-')
            if (isFirstChunk && upstreamRes.status !== 416) {
               await recordCdnDownload(db, token, contentLength)
            }
         } catch (dbErr) {
            console.error('[DB Track Error]:', dbErr)
         }
      })())

      // 5. Susun Header Output (JANGAN hapus Content-Length & Content-Range untuk Video)
      const outHeaders = new Headers()
      for (const [key, value] of upstreamRes.headers.entries()) {
         const lowerKey = key.toLowerCase()
         // Hapus hanya transfer & content-encoding (karena body sudah di-decode/stream)
         if (['transfer-encoding', 'content-encoding', 'content-disposition'].includes(lowerKey)) {
            continue
         }
         try {
            const safeVal = value.replace(/[^\x20-\x7E]/g, (c) => encodeURIComponent(c))
            outHeaders.set(key, safeVal)
         } catch { }
      }

      // Beritahu video player bahwa server mendukung fitur seeking/range
      if (!outHeaders.has('Accept-Ranges')) {
         outHeaders.set('Accept-Ranges', 'bytes')
      }

      outHeaders.set('Access-Control-Allow-Origin', '*')
      outHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length')

      if (record.filename) {
         outHeaders.set('Content-Disposition', formatContentDisposition(record.filename, isInline))
      }

      // Jika response 304 (Not Modified), body harus kosong
      if (upstreamRes.status === 304) {
         return new Response(null, {
            status: 304,
            headers: outHeaders
         })
      }

      return new Response(upstreamRes.body, {
         status: upstreamRes.status, // Menjaga status 206 Partial Content
         headers: outHeaders
      })

   } catch (err) {
      console.error('[CDN Worker Error]:', err)
      return new Response(`Error: ${err.message}`, { status: 500 })
   }
})