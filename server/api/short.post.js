// server/api/short.post.js
import { getCloudflareEnv } from '../utils/cloudflare.js'
import { getWebRequest } from '../utils/web-request.js'
import { createShortUrl } from '../utils/database.js'
import appConfig from '../utils/app-config.js'

function generateShortId(length = 6) {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   let res = ''
   for (let i = 0; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length))
   return res
}

export default defineEventHandler(async (event) => {
   const request = getWebRequest(event)
   const env = getCloudflareEnv(event)
   const url = new URL(request.url)
   const db = env.DB

   try {
      const body = await readBody(event)
      const originalUrl = body?.url

      if (!originalUrl) {
         return new Response(JSON.stringify({ status: false, msg: 'URL parameter is required' }), { status: 400 })
      }

      const shortId = generateShortId(6)
      await createShortUrl(db, shortId, originalUrl)

      return {
         creator: appConfig.watermark.creator,
         status: true,
         data: {
            id: shortId,
            url: `${url.origin}/s/${shortId}`,
            original_url: originalUrl
         }
      }
   } catch (err) {
      return { status: false, msg: err.message }
   }
})