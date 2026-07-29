export function getCloudflareEnv(event) {
   return event.context.cloudflare?.env || globalThis.__env__ || {}
}

export function generateRandomString(length = 8) {
   const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
   const array = new Uint8Array(length)
   crypto.getRandomValues(array)
   return Array.from(array, (byte) => chars[byte % chars.length]).join('')
}

export function parseValidity(validityStr = '30m') {
   const matches = validityStr.match(/^(\d+)([smhd])$/)
   if (!matches) return 30 * 60 * 1000

   const value = Number.parseInt(matches[1], 10)
   const unit = matches[2]

   switch (unit) {
      case 's': return value * 1000
      case 'm': return value * 60 * 1000
      case 'h': return value * 60 * 60 * 1000
      case 'd': return value * 24 * 60 * 60 * 1000
      default: return 30 * 60 * 1000
   }
}

export function getWaitUntil(event) {
   return event.context.cloudflare?.context?.waitUntil || event.waitUntil || ((promise) => promise)
}

export function createJsonResponse(body, status = 200) {
   return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' }
   })
}
