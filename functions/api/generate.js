export async function onRequestPost(context) {
   const { request, env } = context
   const db = env.DB
   const validityStr = env.VALIDITY || '30m'

   try {
      const body = await request.json()
      const { url, headers } = body
      const createdAt = body.created_at || Date.now()

      if (!url) {
         return new Response(JSON.stringify({ error: 'URL is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
         })
      }

      const token = generateRandomString(8)
      const sign = generateRandomString(8)

      await db.prepare(
         'INSERT INTO downloads (token, sign, url, headers, created_at) VALUES (?, ?, ?, ?, ?)'
      )
         .bind(token, sign, url, JSON.stringify(headers || {}), createdAt)
         .run()

      const validityMs = parseValidity(validityStr)
      const expiredTimestamp = Date.now() - validityMs
      context.waitUntil(
         db.prepare('DELETE FROM downloads WHERE created_at < ?').bind(expiredTimestamp).run()
      )

      const requestUrl = new URL(request.url)
      const downloadUrl = `${requestUrl.protocol}//${requestUrl.host}/${token}/${sign}`

      return new Response(JSON.stringify({
         success: true,
         token,
         sign,
         download_url: downloadUrl,
         expires_at: createdAt + validityMs
      }), {
         headers: { 'Content-Type': 'application/json' }
      })

   } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
         status: 500,
         headers: { 'Content-Type': 'application/json' }
      })
   }
}

function generateRandomString(length = 8) {
   const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
   const array = new Uint8Array(length)
   crypto.getRandomValues(array)
   return Array.from(array, (byte) => chars[byte % chars.length]).join('')
}

function parseValidity(validityStr) {
   const matches = validityStr.match(/^(\d+)([smhd])$/)
   if (!matches) return 30 * 60 * 1000
   const value = parseInt(matches[1], 10)
   const unit = matches[2]
   switch (unit) {
      case 's': return value * 1000
      case 'm': return value * 60 * 1000
      case 'h': return value * 60 * 60 * 1000
      case 'd': return value * 24 * 60 * 60 * 1000
      default: return 30 * 60 * 1000
   }
}