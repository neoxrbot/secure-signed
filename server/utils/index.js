import { toWebRequest } from 'h3'

export function getWebRequest(event) {
   return event.web?.request || event.node?.req?.request || toWebRequest(event)
}

export function getCloudflareEnv(event) {
   return event.context?.cloudflare?.env || event.context?.env || globalThis.__env__ || {}
}

export function jsonResponse(event, data, statusCode = 200) {
   setResponseStatus(event, statusCode)
   setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
   return JSON.stringify(data, null, 2)
}

export function generateRandomName(length = 12) {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   let res = ''
   for (let i = 0; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length))
   return res
}

export function humanSize(bytes, decimals = 2) {
   if (!bytes || bytes === 0) return '0 Bytes'
   const k = 1024
   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
   const i = Math.floor(Math.log(bytes) / Math.log(k))
   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function extractTelegramFileId(result) {
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