import { getCloudflareEnv } from '../../utils/cloudflare.js'
import Instagram from '../../utils/instagram.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const query = getQuery(event)
   const username = query.username

   if (!username) {
      return { status: false, msg: 'Username parameter is required' }
   }

   const customCookie = getHeader(event, 'x-instagram-cookie')
   const cookie = customCookie || env?.INSTAGRAM_COOKIE || ''

   const ig = new Instagram(cookie)
   return await ig.getProfile(username)
})