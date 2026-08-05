import { getCloudflareEnv } from '../utils/cloudflare.js'
import { getWebRequest } from '../utils/web-request.js'
import { createShortUrl, cleanOldUrls } from '../utils/database.js'
import appConfig from '../utils/app-config.js'

function generateShortId(length = 6) {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   let res = ''
   for (let i = 0; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length))
   return res
}

function isValidUrl(string) {
   try {
      const parsed = new URL(string)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
   } catch {
      return false
   }
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

      if (!isValidUrl(originalUrl)) {
         return new Response(JSON.stringify({ status: false, msg: 'Invalid URL format (must start with http:// or https://)' }), { status: 400 })
      }

      const shortId = generateShortId(6)
      await createShortUrl(db, shortId, originalUrl)

      if (event.context.cloudflare?.context) {
         event.context.cloudflare.context.waitUntil(cleanOldUrls(db, 30))
      }

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