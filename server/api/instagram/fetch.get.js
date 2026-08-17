import { getCloudflareEnv, jsonResponse } from '../../utils/index.js'
import appConfig from '../../utils/app-config.js'

import Instagram from '../../utils/scraper/instagram.js'

export default defineEventHandler(async (event) => {
   try {
      const env = getCloudflareEnv(event)
      const query = getQuery(event)
      const url = query.url

      if (!url)
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'URL parameter is required'
         })

      const customCookie = getHeader(event, 'x-instagram-cookie')
      const cookie = customCookie || env?.INSTAGRAM_COOKIE || ''

      const ig = new Instagram(cookie)
      const json = await ig.fetch(url)

      return jsonResponse(event, json, json.status ? 200 : 403)
   } catch (err) {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: err.message
      }, 500)
   }
})