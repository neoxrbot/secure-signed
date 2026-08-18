import { getCloudflareEnv, getWebRequest, generateShortId, isValidUrl } from '../utils/index.js'
import { createShortUrl, cleanOldUrls } from '../utils/database.js'
import appConfig from '../utils/app-config.js'

export const properties = {
   error: false
}

export default defineApi({
   properties,
   execution: async (event) => {
      const request = getWebRequest(event)
      const env = getCloudflareEnv(event)
      const url = new URL(request.url)
      const db = env.DB

      try {
         const body = await readBody(event)
         const originalUrl = body?.url

         if (!originalUrl)
            return jsonResponse(event, {
               creator: appConfig.watermark.creator,
               status: false,
               msg: 'URL parameter is required'
            }, 400)

         if (!isValidUrl(originalUrl))
            return jsonResponse(event, {
               creator: appConfig.watermark.creator,
               status: false,
               msg: 'Invalid URL format (must start with http:// or https://)'
            }, 400)

         const shortId = generateShortId(6)
         await createShortUrl(db, shortId, originalUrl)

         if (event.context.cloudflare?.context) {
            event.context.cloudflare.context.waitUntil(cleanOldUrls(db, 30))
         }

         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: true,
            data: {
               id: shortId,
               url: `${url.origin}/s/${shortId}`,
               original_url: originalUrl
            }
         })
      } catch (err) {
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: err.message
         }, 500)
      }
   }
})