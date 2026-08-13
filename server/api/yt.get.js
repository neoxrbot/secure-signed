import { getCloudflareEnv } from '../utils/cloudflare.js'
import { Innertube } from 'youtubei.js/cf-worker'

export default defineEventHandler(async (event) => {
   try {
      const env = getCloudflareEnv(event)
      const query = getQuery(event)
      const url = query.url

      if (!url) {
         return { status: false, msg: 'URL parameter is required' }
      }

      const yt = await Innertube.create();

      const video = await yt.getInfo("jNQXAC9IVRw");

      return video
   } catch (err) {
      return { status: false, msg: err.message }
   }
})