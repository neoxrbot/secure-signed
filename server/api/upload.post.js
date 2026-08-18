import { getCloudflareEnv, getWebRequest, generateRandomName, humanSize, extractTelegramFileId, jsonResponse } from '../utils/index.js'
import { recordHit } from '../utils/database.js'
import appConfig from '../utils/app-config.js'

export const properties = {
   error: false
}

export default defineApi({
   properties,
   execution: async (event) => {
      const request = getWebRequest(event)
      const env = getCloudflareEnv(event)
      const url = new URL(request.url)
      const db = env.DB

      try {
         const formData = await request.formData()
         const file = formData.get('file') || formData.get('files')

         if (!file || !(file instanceof File))
            return jsonResponse(event, {
               creator: appConfig.watermark.creator,
               status: false,
               msg: 'File parameter is required and must be a valid file object'
            }, 400)

         const MAX_SIZE = 20 * 1024 * 1024 // 20 MB Limit
         if (file.size > MAX_SIZE)
            return jsonResponse(event, {
               creator: appConfig.watermark.creator,
               status: false,
               msg: `File is too large! Maximum size is ${humanSize(MAX_SIZE)}`
            }, 400)

         const originalName = file.name || 'file'
         const extension = originalName.includes('.') ? originalName.split('.').pop() : 'bin'
         const randomFilename = `${generateRandomName(12)}.${extension}`

         const tgForm = new FormData()
         tgForm.append('chat_id', env.CHAT_ID)
         tgForm.append('document', file, randomFilename)

         let tgData = null
         try {
            const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendDocument`, {
               method: 'POST',
               body: tgForm
            })
            tgData = await tgRes.json()
         } catch (fetchErr) {
            return jsonResponse(event, {
               creator: appConfig.watermark.creator,
               status: false,
               msg: 'Telegram server timeout or network error'
            }, 500)
         }

         if (!tgData || !tgData.ok || !tgData.result)
            return jsonResponse(event, {
               creator: appConfig.watermark.creator,
               status: false,
               msg: tgData?.description || 'Failed to upload file to Telegram'
            }, 500)

         const telegramFileId = extractTelegramFileId(tgData.result)
         if (!telegramFileId)
            return jsonResponse(event, {
               creator: appConfig.watermark.creator,
               status: false,
               msg: 'Could not find file_id in Telegram response'
            }, 500)

         await recordHit(db, {
            'stats:total_files': 1,
            'stats:total_files_size': file.size
         })

         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: true,
            data: {
               id: telegramFileId,
               filename: randomFilename,
               original_name: originalName,
               bytes: file.size,
               size: humanSize(file.size),
               mime: file.type || 'application/octet-stream',
               extension: extension,
               url: `${url.origin}/file/${telegramFileId}`
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