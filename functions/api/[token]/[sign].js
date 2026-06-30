export async function onRequestGet(context) {
   const { env, params } = context
   const db = env.DB
   const { token, sign } = params
   const validityStr = env.VALIDITY || '30m'

   if (!token || !sign) {
      return new Response('Invalid Request', { status: 400 })
   }

   try {
      const record = await db.prepare(
         'SELECT url, headers, created_at FROM downloads WHERE token = ? AND sign = ?'
      )
         .bind(token, sign)
         .first()

      if (!record) {
         return new Response('Not Found or Expired', { status: 404 })
      }

      const validityMs = parseValidity(validityStr)
      const isExpired = Date.now() - record.created_at > validityMs

      if (isExpired) {
         context.waitUntil(
            db.prepare('DELETE FROM downloads WHERE token = ?').bind(token).run()
         )
         return new Response('Download link has expired', { status: 410 })
      }

      let customHeaders = {}
      try {
         customHeaders = JSON.parse(record.headers)
      } catch (e) {
      }

      const targetResponse = await fetch(record.url, {
         headers: {
            ...customHeaders,
            'Host': new URL(record.url).host
         }
      })

      const responseHeaders = new Headers()

      const headersToForward = [
         'content-type',
         'content-length',
         'content-disposition',
         'accept-ranges',
         'cache-control'
      ]

      for (const header of headersToForward) {
         if (targetResponse.headers.has(header)) {
            responseHeaders.set(header, targetResponse.headers.get(header))
         }
      }

      if (!responseHeaders.has('content-disposition')) {
         const urlObj = new URL(record.url)
         const fileName = urlObj.pathname.split('/').pop() || 'download'
         responseHeaders.set('content-disposition', `attachment; filename="${fileName}"`)
      }

      return new Response(targetResponse.body, {
         status: targetResponse.status,
         statusText: targetResponse.statusText,
         headers: responseHeaders
      })

   } catch (err) {
      return new Response(`Proxy Error: ${err.message}`, { status: 500 })
   }
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