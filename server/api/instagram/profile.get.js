import { getCloudflareEnv, jsonResponse } from '../../utils/index.js'
import appConfig from '../../utils/app-config.js'
import Instagram from '../../utils/scraper/instagram.js'

// Tetap export meta agar bisa di-list oleh /api/endpoints
export const meta = {
   name: 'Instagram Profile',
   category: 'Instagram',
   premium: true,
   error: false,
   parameter: ['username']
}

// Bungkus handler menggunakan defineApi
export default defineApi({
   meta,
   handler: async (event) => {
      try {
         const query = getQuery(event)
         const username = query.username

         const env = getCloudflareEnv(event) || {}
         const customCookie = getHeader(event, 'x-instagram-cookie')
         const cookie = customCookie || env.INSTAGRAM_COOKIE || ''

         const ig = new Instagram(cookie)
         const json = await ig.getProfile(username)

         return jsonResponse(event, json, json.status ? 200 : 403)
      } catch (err) {
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: err.message
         }, 500)
      }
   }
})