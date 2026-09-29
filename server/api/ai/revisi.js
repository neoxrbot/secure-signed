import { getCloudflareEnv, jsonResponse } from '../../utils/index.js'
import appConfig from '../../utils/app-config.js'
import { openRouter } from '../../utils/scraper/openrouter.js'

import systemPrompt from '../../prompts/pr-revisi.txt'

export const properties = {
   name: 'PR Revision',
   category: 'ai',
   premium: true,
   error: false,
   parameter: ['prompt']
}

export default defineApi({
   properties,

   execution: async (event) => {
      try {
         const env = getCloudflareEnv(event)
         const query = getQuery(event)
         const diff = query.prompt

         if (!diff)
            return jsonResponse(event, {
               creator: appConfig.watermark.creator,
               status: false,
               msg: 'Git diff is required'
            })

         const message = await openRouter({
            apiKey: env?.OPENROUTER_API,
            system: systemPrompt,
            prompt: `Git diff:\n\n${diff}`
         })

         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: true,
            data: {
               message
            }
         })

      } catch (err) {
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: err.message
         }, 500)
      }
   }
})