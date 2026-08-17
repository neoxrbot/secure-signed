import { getWebRequest } from '../utils/index.js'

const userAgents = [
   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
   "Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0"
]

export default defineEventHandler(async (event) => {
   const request = getWebRequest(event)
   const url = new URL(request.url)
   const target = url.searchParams.get('url')

   if (!target) return new Response('Missing ?url= parameter', { status: 400 })

   if (request.method === 'OPTIONS') {
      return new Response(null, {
         status: 204,
         headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*'
         }
      })
   }

   const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)]
   const spoofIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`

   const headers = new Headers()
   headers.set('User-Agent', randomUA)
   headers.set('X-Forwarded-For', spoofIp)
   headers.set('X-Real-IP', spoofIp)
   headers.set('Accept', '*/*')

   try {
      const upstream = await fetch(target, {
         method: request.method,
         headers,
         redirect: 'follow'
      })

      const resHeaders = new Headers(upstream.headers)
      resHeaders.set('Access-Control-Allow-Origin', '*')
      resHeaders.delete('Content-Security-Policy')

      return new Response(upstream.body, {
         status: upstream.status,
         headers: resHeaders
      })
   } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 })
   }
})