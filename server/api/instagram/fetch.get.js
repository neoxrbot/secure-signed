import { getCloudflareEnv } from '../../utils/cloudflare.js'
import Instagram from '../../utils/scraper/instagram.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const query = getQuery(event)
   const url = query.url

   if (!url) {
      return { status: false, msg: 'URL parameter is required' }
   }

   const customCookie = getHeader(event, 'x-instagram-cookie')
   const cookie = customCookie || env?.INSTAGRAM_COOKIE || ''

   const ig = new Instagram(cookie)
   return await ig.fetch(url)
})