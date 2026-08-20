import { getCloudflareEnv } from '../../utils/index.js'
import {
   getSignedCdn,
   recordCdnDownload,
   cleanExpiredCdn
} from '../../utils/database.js'

function isDomainAllowed(domain, allowedPatternsStr) {
   if (!allowedPatternsStr) return true

   const patterns = allowedPatternsStr
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)

   const targetDomain = domain.toLowerCase()

   return patterns.some(pattern => {
      if (pattern.startsWith('*.')) {
         const baseDomain = pattern.slice(2)

         return (
            targetDomain === baseDomain ||
            targetDomain.endsWith('.' + baseDomain)
         )
      }

      return targetDomain === pattern
   })
}

/**
 * Content-Disposition yang aman untuk UTF-8 filename.
 */
function formatContentDisposition(filename, inline = false) {
   if (!filename || typeof filename !== 'string') {
      return inline ? 'inline' : 'attachment'
   }

   let cleanName = filename

   try {
      cleanName = decodeURIComponent(filename)
   } catch { }

   cleanName = cleanName
      .replace(/[\r\n]/g, '')
      .trim()

   const asciiFallback =
      cleanName
         .replace(/["\\]/g, '')
         .replace(/[^\x20-\x7E]/g, '_')
         .trim() || 'file'

   const encodedUtf8 = encodeURIComponent(cleanName)
      .replace(/['()]/g, char =>
         '%' + char.charCodeAt(0).toString(16).toUpperCase()
      )
      .replace(/\*/g, '%2A')

   const type = inline ? 'inline' : 'attachment'

   return `${type}; filename="${asciiFallback}"; filename*=UTF-8''${encodedUtf8}`
}

/**
 * Pastikan URL valid.
 */
function safeTargetUrl(urlStr) {
   try {
      return new URL(urlStr).href
   } catch {
      return encodeURI(urlStr)
   }
}

/**
 * Ambil header request secara kompatibel
 * dengan Nitro / Node / Cloudflare.
 */
function getClientHeader(event, name) {
   try {
      if (typeof getRequestHeader === 'function') {
         const value = getRequestHeader(event, name)

         if (value) return value
      }

      if (typeof getHeader === 'function') {
         const value = getHeader(event, name)

         if (value) return value
      }
   } catch { }

   const lower = name.toLowerCase()

   if (event.node?.req?.headers) {
      return (
         event.node.req.headers[lower] ||
         event.node.req.headers[name] ||
         null
      )
   }

   if (event.web?.request?.headers?.get) {
      return event.web.request.headers.get(name)
   }

   if (event.request?.headers?.get) {
      return event.request.headers.get(name)
   }

   return null
}

/**
 * Header yang aman untuk diteruskan dari upstream.
 *
 * Kita sengaja TIDAK meneruskan semua header,
 * karena beberapa header hop-by-hop dapat menyebabkan
 * masalah pada proxy/streaming.
 */
const RESPONSE_HEADERS = [
   'accept-ranges',
   'cache-control',
   'content-length',
   'content-range',
   'content-type',
   'etag',
   'expires',
   'last-modified',
   'pragma'
]

export default defineEventHandler(async event => {
   const env = getCloudflareEnv(event)

   const params = event.context.params || {}
   const token = params.token

   const db = env.DB

   const requestUrl = new URL(
      event.node?.req?.url ||
      event.web?.request?.url ||
      '/',
      'http://localhost'
   )

   const requestedDomain =
      requestUrl.searchParams.get('domain') || ''

   const isInline =
      requestUrl.searchParams.get('inline') === 'true' ||
      requestUrl.searchParams.has('play')

   try {
      /*
       * ============================================================
       * 1. VALIDASI DOMAIN
       * ============================================================
       */

      const allowedConfig =
         env.ALLOWED_CDN_DOMAINS ||
         'neoxr.eu, *.neoxr.eu'

      if (
         !requestedDomain ||
         !isDomainAllowed(
            requestedDomain,
            allowedConfig
         )
      ) {
         return new Response(
            `Domain '${requestedDomain}' is not authorized for signed CDN.`,
            {
               status: 403
            }
         )
      }

      /*
       * ============================================================
       * 2. VALIDASI TOKEN
       * ============================================================
       */

      const record = await getSignedCdn(
         db,
         token
      )

      if (!record) {
         return new Response(
            'Invalid or unknown CDN token',
            {
               status: 404
            }
         )
      }

      /*
       * ============================================================
       * 3. CEK EXPIRATION
       * ============================================================
       */

      const now = Math.floor(
         Date.now() / 1000
      )

      const expiredAt =
         record.expired_at > 1e11
            ? Math.floor(record.expired_at / 1000)
            : record.expired_at

      if (now > expiredAt) {
         event.waitUntil(
            cleanExpiredCdn(db)
         )

         return new Response(
            'CDN link has expired',
            {
               status: 410
            }
         )
      }

      /*
       * ============================================================
       * 4. REQUEST METHOD
       * ============================================================
       */

      const method =
         event.node?.req?.method ||
         event.web?.request?.method ||
         'GET'

      /*
       * ============================================================
       * 5. REQUEST HEADERS
       *
       * Penting untuk video/audio/file besar:
       *
       * Range
       * If-Range
       * If-None-Match
       * If-Modified-Since
       * User-Agent
       *
       * Jangan forward semua header client.
       * ============================================================
       */

      const forwardHeaders = new Headers()

      const range = getClientHeader(
         event,
         'range'
      )

      const ifRange = getClientHeader(
         event,
         'if-range'
      )

      const ifNoneMatch = getClientHeader(
         event,
         'if-none-match'
      )

      const ifModifiedSince = getClientHeader(
         event,
         'if-modified-since'
      )

      const userAgent = getClientHeader(
         event,
         'user-agent'
      )

      if (range) {
         forwardHeaders.set(
            'Range',
            range
         )
      }

      if (ifRange) {
         forwardHeaders.set(
            'If-Range',
            ifRange
         )
      }

      if (ifNoneMatch) {
         forwardHeaders.set(
            'If-None-Match',
            ifNoneMatch
         )
      }

      if (ifModifiedSince) {
         forwardHeaders.set(
            'If-Modified-Since',
            ifModifiedSince
         )
      }

      if (userAgent) {
         forwardHeaders.set(
            'User-Agent',
            userAgent
         )
      }

      /*
       * ============================================================
       * 6. CUSTOM HEADERS DARI DATABASE
       * ============================================================
       */

      if (record.custom_headers) {
         try {
            const parsed =
               typeof record.custom_headers === 'string'
                  ? JSON.parse(record.custom_headers)
                  : record.custom_headers

            if (
               parsed &&
               typeof parsed === 'object'
            ) {
               for (
                  const [key, value]
                  of Object.entries(parsed)
               ) {
                  try {
                     if (
                        value !== undefined &&
                        value !== null
                     ) {
                        forwardHeaders.set(
                           key,
                           String(value)
                              .replace(/[\r\n]/g, '')
                        )
                     }
                  } catch { }
               }
            }
         } catch (error) {
            console.error(
               '[CDN Custom Header Error]',
               error
            )
         }
      }

      /*
       * ============================================================
       * 7. FETCH UPSTREAM
       *
       * PENTING:
       * body TIDAK di-buffer.
       *
       * upstreamRes.body langsung diteruskan
       * ke Response di bawah.
       * ============================================================
       */

      const targetUrl =
         safeTargetUrl(
            record.target_url
         )

      console.log(
         '[CDN FETCH]',
         method,
         targetUrl,
         {
            range
         }
      )

      const upstreamRes = await fetch(
         targetUrl,
         {
            method,
            headers: forwardHeaders,
            redirect: 'follow'
         }
      )

      /*
       * ============================================================
       * 8. VALIDASI STATUS
       * ============================================================
       */

      const allowedStatuses = [
         200,
         206,
         304,
         416
      ]

      if (
         !allowedStatuses.includes(
            upstreamRes.status
         )
      ) {
         console.error(
            '[CDN UPSTREAM ERROR]',
            {
               status: upstreamRes.status,
               url: targetUrl
            }
         )

         return new Response(
            `Failed fetching remote file: ${upstreamRes.status}`,
            {
               status: 502
            }
         )
      }

      /*
       * ============================================================
       * 9. AMBIL UKURAN FILE
       * ============================================================
       */

      const contentLengthHeader =
         upstreamRes.headers.get(
            'content-length'
         )

      const contentLength =
         contentLengthHeader
            ? Number(contentLengthHeader)
            : 0

      /*
       * ============================================================
       * 10. VALIDASI MAX SIZE
       *
       * Hanya lakukan pada 200.
       *
       * Untuk 206, Content-Length adalah ukuran CHUNK,
       * bukan ukuran keseluruhan file.
       * ============================================================
       */

      if (
         upstreamRes.status === 200 &&
         Number.isFinite(
            contentLength
         ) &&
         contentLength > Number(record.max_bytes)
      ) {
         return new Response(
            'File size exceeds allowed signed limit',
            {
               status: 413
            }
         )
      }

      /*
       * ============================================================
       * 11. CATAT DOWNLOAD
       * ============================================================
       */

      event.waitUntil(
         (async () => {
            try {
               const isFirstChunk =
                  !range ||
                  range.startsWith('bytes=0-')

               if (
                  isFirstChunk &&
                  upstreamRes.status !== 416
               ) {
                  await recordCdnDownload(
                     db,
                     token,
                     contentLength
                  )
               }
            } catch (error) {
               console.error(
                  '[DB Track Error]',
                  error
               )
            }
         })()
      )

      /*
       * ============================================================
       * 12. RESPONSE HEADERS
       *
       * Jangan copy semua header upstream.
       * Hanya header yang relevan untuk file delivery.
       * ============================================================
       */

      const responseHeaders =
         new Headers()

      for (
         const name
         of RESPONSE_HEADERS
      ) {
         const value =
            upstreamRes.headers.get(
               name
            )

         if (value) {
            responseHeaders.set(
               name,
               value
            )
         }
      }

      /*
       * Pastikan browser tahu bahwa
       * Range request didukung.
       */

      if (
         !responseHeaders.has(
            'accept-ranges'
         )
      ) {
         responseHeaders.set(
            'Accept-Ranges',
            'bytes'
         )
      }

      /*
       * CORS
       */

      responseHeaders.set(
         'Access-Control-Allow-Origin',
         '*'
      )

      responseHeaders.set(
         'Access-Control-Allow-Headers',
         'Range, Content-Type, Authorization'
      )

      responseHeaders.set(
         'Access-Control-Expose-Headers',
         'Content-Length, Content-Range, Accept-Ranges, Content-Type, ETag, Last-Modified'
      )

      /*
       * Content-Disposition
       */

      if (record.filename) {
         responseHeaders.set(
            'Content-Disposition',
            formatContentDisposition(
               record.filename,
               isInline
            )
         )
      }

      /*
       * ============================================================
       * 13. 304
       * ============================================================
       */

      if (
         upstreamRes.status === 304
      ) {
         return new Response(
            null,
            {
               status: 304,
               headers: responseHeaders
            }
         )
      }

      /*
       * ============================================================
       * 14. STREAMING RESPONSE
       *
       * INI BAGIAN TERPENTING.
       *
       * Jangan:
       *
       * await upstreamRes.arrayBuffer()
       * await upstreamRes.blob()
       * await upstreamRes.text()
       *
       * karena itu akan membuat file besar
       * masuk ke memory.
       * ============================================================
       */

      return new Response(
         upstreamRes.body,
         {
            status: upstreamRes.status,
            headers: responseHeaders
         }
      )

   } catch (error) {
      console.error(
         '[CDN Worker Error]',
         error
      )

      const message =
         error instanceof Error
            ? error.message
            : String(error)

      return new Response(
         `Error: ${message}`,
         {
            status: 500,
            headers: {
               'Content-Type':
                  'text/plain; charset=utf-8'
            }
         }
      )
   }
})