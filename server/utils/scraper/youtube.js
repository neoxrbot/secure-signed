import appConfig from '../app-config.js'
import { Innertube, UniversalCache, Platform } from 'youtubei.js/cf-worker'

Platform.shim.eval = async (data, env) => {
   const result = {};

   if (env?.n) {
      result.n = env.n;
   }

   if (env?.sig) {
      result.sig = env.sig;
   }

   return result;
};

export default class YouTube {
   constructor(cookie) {
      this.cookie = cookie

      this.clients = new Map()
      this.poTokenPromise = Promise.resolve()
   }

   buildMsg = (message, status = false) => ({
      creator: appConfig.watermark.creator,
      status,
      msg: message
   })

   getId = url => {
      const regEx = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|shorts\/|v=)([^#\&\?]*).*/
      const match = url.match(regEx)
      return match ? match[2] : url
   }

   async getInfo(url) {
      try {
         const videoId = this.getId(url)

         const innertube = await Innertube.create({
            cache: new UniversalCache(true),
            retrieve_player: true,
            // cookie: fs.readFileSync('./cookies/cookie1.txt', 'utf-8'),
            client_type: 'MWEB'
         });

         const yt = await innertube.getBasicInfo(videoId, { client: 'MWEB' })
         return yt
      } catch (error) {
         return this.buildMsg(error.message)
      }
   }
}