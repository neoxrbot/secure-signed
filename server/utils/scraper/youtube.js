import appConfig from '../app-config.js'

export default class YouTube {
   constructor(apikey) {
      this.apikey = apikey
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
         const params = new URLSearchParams({
            part: 'snippet,contentDetails,statistics,status',
            id: this.getId(url),
            key: this.apikey
         });

         const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)

         if (!res.ok) {
            const errorText = await res.text()
            throw new Error(`HTTP ${res.status}: ${errorText.substring(0, 200)}`);
         }

         const data = await res.json().catch(() => null)
         
         return {
            data
         };
      } catch (error) {
         return this.buildMsg(error.message)
      }
   }
}