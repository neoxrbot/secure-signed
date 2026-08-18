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

export function generateToken(length = 20) {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   let res = ''
   for (let i = 0; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length))
   return res
}

export function generateShortId(length = 6) {
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

export function isValidUrl(string) {
   try {
      const parsed = new URL(string)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
   } catch {
      return false
   }
}

export function getRandomPublicIp() {
   const pools = [
      [73, Math.floor(Math.random() * 255)],
      [24, Math.floor(Math.random() * 255)],
      [68, Math.floor(Math.random() * 255)],
      [107, Math.floor(Math.random() * 128) + 128],
      [108, Math.floor(Math.random() * 255)],
      [71, Math.floor(Math.random() * 255)],
      [98, Math.floor(Math.random() * 255)],
      [172, Math.floor(Math.random() * 31) + 16]
   ]
   const p = pools[Math.floor(Math.random() * pools.length)]
   const b3 = Math.floor(Math.random() * 254) + 1
   const b4 = Math.floor(Math.random() * 254) + 1
   return `${p[0]}.${p[1]}.${b3}.${b4}`
}

export function escapeSqlValue(val) {
   if (val === null || val === undefined) return 'NULL'
   if (typeof val === 'number') return val.toString()
   if (typeof val === 'boolean') return val ? '1' : '0'
   const str = String(val).replace(/'/g, "''")
   return `'${str}'`
}
