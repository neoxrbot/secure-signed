import { getCloudflareEnv, getWebRequest, generateToken, jsonResponse } from '../utils/index.js'
import { createSignedCdn } from '../utils/database.js'
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
         const { target_url, filename, headers } = body

         if (!target_url) {
            return new Response(JSON.stringify({ status: false, msg: 'target_url parameter is required' }), { status: 400 })
         }

         const token = generateToken(20)
         const expiryMinutes = parseInt(env.CDN_EXPIRY_MINUTES || '15', 10)
         const maxBytes = (parseInt(env.CDN_MAX_SIZE_MB || '500', 10)) * 1024 * 1024

         const nowInSeconds = Math.floor(Date.now() / 1000)
         const expiredAt = nowInSeconds + (expiryMinutes * 60)

         await createSignedCdn(db, {
            token,
            targetUrl: target_url,
            filename,
            customHeaders: headers,
            maxBytes,
            expiredAt
         })

         const primaryDomain = 'neoxr.eu'
         const signedLink = `${url.protocol}//${url.host}/token/${token}?domain=${primaryDomain}`

         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: true,
            data: {
               token,
               signed_url: signedLink,
               expires_at: new Date(expiredAt * 1000).toISOString(),
               max_size_mb: parseInt(env.CDN_MAX_SIZE_MB || '500', 10)
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