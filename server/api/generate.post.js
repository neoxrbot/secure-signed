import { createJsonResponse, generateRandomString, getCloudflareEnv, parseValidity, waitUntil } from '../../utils/downloads.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const db = env.DB
   const validityStr = env.VALIDITY || '30m'

   if (!db) {
      return createJsonResponse({ status: false, error: 'Database binding DB is not configured' }, 500)
   }

   try {
      const body = await readBody(event)
      const { url, headers, filename } = body || {}
      const createdAt = body?.created_at || Date.now()

      if (!url) {
         return createJsonResponse({ status: false, error: 'URL is required' }, 400)
      }

      const token = generateRandomString(8)
      const sign = generateRandomString(8)

      await db.prepare(
         'INSERT INTO downloads (token, sign, url, headers, created_at, filename) VALUES (?, ?, ?, ?, ?, ?)'
      )
         .bind(token, sign, url, JSON.stringify(headers || {}), createdAt, filename || null)
         .run()

      const validityMs = parseValidity(validityStr)
      const expiredTimestamp = Date.now() - validityMs
      waitUntil(event,
         db.prepare('DELETE FROM downloads WHERE created_at < ?').bind(expiredTimestamp).run()
      )

      const requestUrl = getRequestURL(event)
      const downloadUrl = `${requestUrl.protocol}//${requestUrl.host}/${token}/${sign}`

      return createJsonResponse({
         status: true,
         data: {
            token,
            sign,
            download_url: downloadUrl,
            expires_at: createdAt + validityMs
         }
      })
   } catch (err) {
      return createJsonResponse({ status: false, error: err.message }, 500)
   }
})