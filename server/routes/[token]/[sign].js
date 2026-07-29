import { getCloudflareEnv, parseValidity, waitUntil } from '../../../utils/downloads.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const db = env.DB
   const validityStr = env.VALIDITY || '30m'
   const token = getRouterParam(event, 'token')
   const sign = getRouterParam(event, 'sign')

   if (!db) {
      throw createError({ statusCode: 500, statusMessage: 'Database binding DB is not configured' })
   }

   try {
      const record = await db.prepare(
         'SELECT url, headers, created_at, filename FROM downloads WHERE token = ? AND sign = ?'
      )
         .bind(token, sign)
         .first()

      if (!record) {
         throw createError({ statusCode: 404, statusMessage: 'Not Found' })
      }

      const validityMs = parseValidity(validityStr)
      const isExpired = Date.now() - record.created_at > validityMs

      if (isExpired) {
         waitUntil(event,
            db.prepare('DELETE FROM downloads WHERE token = ?').bind(token).run()
         )
         throw createError({ statusCode: 404, statusMessage: 'Not Found' })
      }

      let customHeaders = {}
      try {
         customHeaders = JSON.parse(record.headers)
      } catch {
         customHeaders = {}
      }

      let targetResponse
      const attempts = 2
      for (let i = 0; i < attempts; i++) {
         try {
            targetResponse = await fetch(record.url, {
               headers: {
                  ...customHeaders,
                  Host: new URL(record.url).host
               }
            })
            if (targetResponse?.body && targetResponse.status < 500) {
               break
            }
         } catch (err) {
            if (i === attempts - 1) {
               throw err
            }
         }
      }

      if (!targetResponse?.body) {
         return new Response('Gateway Error: Empty body or connection failed', { status: 502 })
      }

      const responseHeaders = new Headers()
      const headersToForward = [
         'content-type',
         'content-length',
         'accept-ranges',
         'cache-control'
      ]

      for (const header of headersToForward) {
         if (targetResponse.headers.has(header)) {
            responseHeaders.set(header, targetResponse.headers.get(header))
         }
      }

      let disposition = ''
      if (record.filename) {
         disposition = `attachment; filename="${record.filename}"`
      } else if (targetResponse.headers.has('content-disposition')) {
         disposition = targetResponse.headers.get('content-disposition')
      } else {
         const urlObj = new URL(record.url)
         const fileName = urlObj.pathname.split('/').pop() || 'download'
         disposition = `attachment; filename="${fileName}"`
      }
      responseHeaders.set('content-disposition', disposition)

      return new Response(targetResponse.body, {
         status: targetResponse.status,
         statusText: targetResponse.statusText,
         headers: responseHeaders
      })
   } catch (err) {
      if (err.statusCode === 404) {
         throw err
      }
      return new Response(`Proxy Error: ${err.message}`, { status: 500 })
   }
})