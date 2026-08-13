import { getCloudflareEnv } from '../utils/cloudflare.js'
import { Innertube } from 'youtubei.js/cf-worker'
import { Platform } from 'youtubei.js'
/**
 * Shim evaluator for YouTube player obfuscated code execution.
 * @param {object} data - Object containing JavaScript output string.
 * @returns {Promise<any>} Execution result.
 */
Platform.shim.eval = async (data) => new Function(data.output)()

export default defineEventHandler(async (event) => {
   try {
      const env = getCloudflareEnv(event)
      const query = getQuery(event)
      const url = query.url

      if (!url) {
         return { status: false, msg: 'URL parameter is required' }
      }

      const yt = await Innertube.create();

      const video = await yt.getBasicInfo('IAT2PlWR1Cg');

      return video
   } catch (err) {
      return { status: false, msg: err.message }
   }
})