import appConfig from './app-config.js'

export default class YouTube {
   constructor(apiKey) {
      this.apiKey = apiKey

      this.player = `https://youtubei.googleapis.com/youtubei/v1/player?key=${this.apiKey}`;

      this.headers = {
         'Content-Type': 'application/json',
         'User-Agent': 'com.google.android.youtube/20.10.41(Linux; U; Android 16; en_US; sdk_gphone16k_x86_64 Build/BE4B.251210.005) gzip',
         'Accept-Language': 'en-US',
         'X-Goog-Api-Format-Version': '2'
      }

      this.client = {
         client: {
            clientName: 'ANDROID',
            clientVersion: '20.10.41',
            androidSdkVersion: 36,
            osName: 'Android',
            osVersion: '16',
            platform: 'MOBILE',
            hl: 'en',
            gl: 'US',
            utcOffsetMinutes: 0,
         }
      }
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

   async getInfo(videoId) {
      try {
         const res = await fetch(this.player, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
               context: this.client,
               videoId,
               playbackContext: {
                  contentPlaybackContext: { html5Preference: 'HTML5_PREF_WANTS' },
               }
            })
         })

         if (!res.ok) {
            const errorText = await res.text()
            throw new Error(`HTTP ${res.status}: ${errorText.substring(0, 200)}`);
         }

         const data = await res.json();

         if (!data || !data.videoDetails) {
            throw new Error('No videoDetails in response');
         }

         return {
            videoId,
            title: data.videoDetails.title,
            thumbnail: data.videoDetails.thumbnail.thumbnails.reduce((a, b) => (a.width > b.width ? a : b)).url,
            author: data.videoDetails.author,
            duration: parseInt(data.videoDetails.lengthSeconds) || 0,
            // duration_string: YouFetch.toMim(parseInt(data.videoDetails.lengthSeconds) || 0),
            channel: data.videoDetails.author,
            views: data.videoDetails.viewCount,
            description: data.videoDetails?.shortDescription || '',
            streamingData: data.streamingData || {},
         };
      } catch (error) {
         return this.buildMsg(error.message)
      }
   }
}