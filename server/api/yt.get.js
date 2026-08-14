import { getCloudflareEnv } from '../utils/cloudflare.js'
import YouTube from '../utils/scraper/youtube.js'

export default defineEventHandler(async (event) => {
   try {
      const env = getCloudflareEnv(event)
      const query = getQuery(event)
      const url = query.url

      if (!url) {
         return { status: false, msg: 'URL parameter is required' }
      }

      const yt = new YouTube(env.GOOGLE_API)

      const result = await yt.getInfo(id)

      return result
   } catch (err) {
      return { status: false, msg: err.message }
   }
})