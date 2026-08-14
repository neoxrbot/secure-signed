import appConfig from '../app-config.js'
import { Innertube, Platform } from 'youtubei.js/cf-worker'

// /**
//  * Shim evaluator for YouTube player obfuscated code execution.
//  * @param {object} data - Object containing JavaScript output string.
//  * @returns {Promise<any>} Execution result.
//  */
// Platform.shim.eval = async (data) => new Function(data.output)()

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
         return {
            url
         }
      } catch (error) {
         return this.buildMsg(error.message)
      }
   }
}