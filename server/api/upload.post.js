import { getCloudflareEnv, getWebRequest } from '../utils/index.js'
import { recordHit } from '../utils/database.js'
import appConfig from '../utils/app-config.js'

function generateRandomName(length = 12) {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   let res = ''
   for (let i = 0; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length))
   return res
}

function humanSize(bytes, decimals = 2) {
   if (!bytes || bytes === 0) return '0 Bytes'
   const k = 1024
   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
   const i = Math.floor(Math.log(bytes) / Math.log(k))
   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

function extractTelegramFileId(result) {
   if (!result || typeof result !== 'object') return null
   if (result.document?.file_id) return result.document.file_id
   if (result.video?.file_id) return result.video.file_id
   if (result.audio?.file_id) return result.audio.file_id
   if (result.voice?.file_id) return result.voice.file_id
   if (Array.isArray(result.photo) && result.photo.length > 0) {
      return result.photo[result.photo.length - 1].file_id
   }
   for (const val of Object.values(result)) {
      if (val && typeof val === 'object' && val.file_id) {
         return val.file_id
      }
   }
   return null
}

export default defineEventHandler(async (event) => {
   const request = getWebRequest(event)
   const env = getCloudflareEnv(event)
   const url = new URL(request.url)
   const db = env.DB

   try {
      const formData = await request.formData()
      const file = formData.get('file') || formData.get('files')

      if (!file || !(file instanceof File)) {
         return new Response(JSON.stringify({
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'File parameter is required and must be a valid file object'
         }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }

      const MAX_SIZE = 20 * 1024 * 1024 // 20 MB Limit
      if (file.size > MAX_SIZE) {
         return new Response(JSON.stringify({
            creator: appConfig.watermark.creator,
            status: false,
            msg: `File is too large! Maximum size is ${humanSize(MAX_SIZE)}`
         }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }

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
         return new Response(JSON.stringify({
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'Telegram server timeout or network error'
         }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }

      if (!tgData || !tgData.ok || !tgData.result) {
         return new Response(JSON.stringify({
            creator: appConfig.watermark.creator,
            status: false,
            msg: tgData?.description || 'Failed to upload file to Telegram'
         }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }

      const telegramFileId = extractTelegramFileId(tgData.result)
      if (!telegramFileId) {
         return new Response(JSON.stringify({
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'Could not find file_id in Telegram response'
         }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }

      await recordHit(db, {
         'stats:total_files': 1,
         'stats:total_files_size': file.size
      })

      return new Response(JSON.stringify({
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
      }, null, 2), {
         headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
         }
      })

   } catch (err) {
      return new Response(JSON.stringify({
         creator: appConfig.watermark.creator,
         status: false,
         msg: err.message
      }), { status: 500, headers: { 'Content-Type': 'application/json' } })
   }
})