import { getCloudflareEnv, jsonResponse } from '../../utils/index.js'
import appConfig from '../../utils/app-config.js'
import { openRouter } from '../../utils/scraper/openrouter.js'

import systemPrompt from '../../prompts/code-review.txt'

export const properties = {
   name: 'AI Code Review',
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
         
         const input = event.context.input || getQuery(event)
         const diff = input.prompt

         if (!diff)
            return jsonResponse(event, {
               creator: appConfig.watermark.creator,
               status: false,
               msg: 'Git diff is required'
            }, 400)

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