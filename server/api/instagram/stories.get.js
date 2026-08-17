import { getCloudflareEnv, jsonResponse } from '../../utils/index.js'
import appConfig from '../../utils/app-config.js'

import Instagram from '../../utils/scraper/instagram.js'

export default defineEventHandler(async (event) => {
   try {
      const env = getCloudflareEnv(event)
      const query = getQuery(event)
      const username = query.username

      if (!username)
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'Username parameter is required'
         })

      const customCookie = getHeader(event, 'x-instagram-cookie')
      const cookie = customCookie || env?.INSTAGRAM_COOKIE || ''

      const ig = new Instagram(cookie)
      const json = await ig.getStories(username)

      return jsonResponse(event, json, json.status ? 200 : 403)
   } catch (err) {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: err.message
      }, 500)
   }
})