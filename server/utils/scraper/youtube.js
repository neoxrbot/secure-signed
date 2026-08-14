import appConfig from '../app-config.js'

export default class YouTube {
   constructor(apikey, cookie) {
      this.apikey = apikey
      this.cookie = cookie

      this.player =
         `https://youtubei.googleapis.com/youtubei/v1/player?key=${this.apikey}`

      this.headers = {
         'Content-Type': 'application/json',
         'User-Agent':
            'Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
         'Accept-Language': 'en-US,en;q=0.9',
         'X-Goog-Api-Format-Version': '2',
         ...(this.cookie ? { Cookie: this.cookie } : {})
      }

      this.client = {
         client: {
            clientName: 'MWEB',
            clientVersion: '2.20260205.04.01',
            platform: 'MOBILE',
            osName: 'Android',
            osVersion: '16',
            hl: 'en',
            gl: 'US',
            utcOffsetMinutes: 0
         }
      }
   }

   buildMsg = (message, status = false) => ({
      creator: appConfig.watermark.creator,
      status,
      msg: message
   })

   getId = url => {
      const regEx =
         /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|shorts\/|v=)([^#&?]*).*/

      const match = url.match(regEx)

      return match ? match[2] : url
   }

   async getInfo(url) {
      try {
         const videoId = this.getId(url)

         const res = await fetch(this.player, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
               context: this.client,
               videoId,
               playbackContext: {
                  contentPlaybackContext: {
                     html5Preference: 'HTML5_PREF_WANTS'
                  }
               }
            })
         })

         const text = await res.text()

         if (!res.ok) {
            throw new Error(
               `HTTP ${res.status}: ${text.substring(0, 300)}`
            )
         }

         const data = JSON.parse(text)

         if (!data?.videoDetails) {
            throw new Error(
               data?.playabilityStatus?.reason ||
               'No videoDetails in response'
            )
         }

         return {
            videoId,
            title: data.videoDetails.title,
            thumbnail:
               data.videoDetails.thumbnail?.thumbnails?.at(-1)?.url || null,
            author: data.videoDetails.author,
            duration: Number(data.videoDetails.lengthSeconds) || 0,
            channel: data.videoDetails.author,
            views: data.videoDetails.viewCount,
            description: data.videoDetails.shortDescription || '',
            streamingData: data.streamingData || {}
         }

      } catch (error) {
         return this.buildMsg(error.message)
      }
   }
}