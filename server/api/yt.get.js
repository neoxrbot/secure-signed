import { getCloudflareEnv } from '../utils/cloudflare.js'
import { Innertube } from 'youtubei.js/cf-worker'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const query = getQuery(event)
   const url = query.url

   if (!url) {
      return { status: false, msg: 'URL parameter is required' }
   }

   const yt = await Innertube.create();

   const video = await yt.getInfo("jNQXAC9IVRw");

   return new Response(JSON.stringify(video), { headers: { 'Content-Type': 'application/json' } })
})