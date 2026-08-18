import { getCloudflareEnv, getWebRequest, getRandomPublicIp } from '../utils/index.js'

export default defineEventHandler(async (event) => {
   const request = getWebRequest(event)
   const env = getCloudflareEnv(event)
   const url = new URL(request.url)
   const target = url.searchParams.get("url")

   if (!target) {
      return new Response("Missing ?url= parameter", { status: 400 })
   }

   if (request.method === "OPTIONS") {
      return new Response(null, {
         status: 204,
         headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
         }
      })
   }

   let targetUrl
   try {
      targetUrl = new URL(target)
   } catch {
      return new Response("Invalid target URL", { status: 400 })
   }

   const fingerprints = [
      {
         ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
         ch: '"Not-A.Brand";v="99", "Chromium";v="124", "Google Chrome";v="124"',
         platform: '"Windows"',
         mobile: "?0"
      },
      {
         ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
         ch: '"Not-A.Brand";v="99", "Chromium";v="123", "Google Chrome";v="123"',
         platform: '"macOS"',
         mobile: "?0"
      },
      {
         ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
         ch: '"Not-A.Brand";v="99", "Chromium";v="124", "Microsoft Edge";v="124"',
         platform: '"Windows"',
         mobile: "?0"
      },
      {
         ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
         ch: '"Not-A.Brand";v="99", "Chromium";v="122", "Google Chrome";v="122"',
         platform: '"Linux"',
         mobile: "?0"
      }
   ]

   const profile = fingerprints[Math.floor(Math.random() * fingerprints.length)]
   const mainIp = getRandomPublicIp()
   const gatewayIp = getRandomPublicIp()

   const newHeaders = new Headers()

   const excludeHeaders = [
      "host",
      "connection",
      "keep-alive",
      "content-length",
      "transfer-encoding",
      "user-agent",
      "sec-ch-ua",
      "sec-ch-ua-mobile",
      "sec-ch-ua-platform",
      "accept-language",
      "accept-encoding",
      "upgrade-insecure-requests",
      "sec-fetch-site",
      "sec-fetch-mode",
      "sec-fetch-user",
      "sec-fetch-dest",
      "x-forwarded-for",
      "x-real-ip",
      "client-ip",
      "true-client-ip",
      "x-client-ip",
      "x-originating-ip",
      "via",
      "referer"
   ]

   for (const [key, value] of request.headers.entries()) {
      const lowerKey = key.toLowerCase()
      if (excludeHeaders.includes(lowerKey) || lowerKey.startsWith("cf-")) {
         continue
      }
      newHeaders.set(key, value)
   }

   newHeaders.set("Host", targetUrl.host)
   newHeaders.set("User-Agent", profile.ua)
   if (profile.ch) newHeaders.set("Sec-CH-UA", profile.ch)
   newHeaders.set("Sec-CH-UA-Mobile", profile.mobile)
   newHeaders.set("Sec-CH-UA-Platform", profile.platform)

   newHeaders.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")
   newHeaders.set("Accept-Language", `en-US,en;q=0.9,id;q=${(0.7 + Math.random() * 0.2).toFixed(1)}`)
   newHeaders.set("Accept-Encoding", "gzip, deflate, br")
   newHeaders.set("Upgrade-Insecure-Requests", "1")
   newHeaders.set("Sec-Fetch-Site", "cross-site")
   newHeaders.set("Sec-Fetch-Mode", "navigate")
   newHeaders.set("Sec-Fetch-User", "?1")
   newHeaders.set("Sec-Fetch-Dest", "document")
   newHeaders.set("Referer", `${targetUrl.origin}/`)

   newHeaders.set("X-Forwarded-For", `${mainIp}, ${gatewayIp}`)
   newHeaders.set("X-Real-IP", mainIp)
   newHeaders.set("Client-IP", mainIp)
   newHeaders.set("True-Client-IP", mainIp)
   newHeaders.set("X-Client-IP", mainIp)
   newHeaders.set("X-Originating-IP", mainIp)

   const body = (request.method === "GET" || request.method === "HEAD")
      ? null
      : await request.arrayBuffer()

   try {
      const upstream = await fetch(target, {
         method: request.method,
         headers: newHeaders,
         body: body,
         redirect: "follow",
         cf: {
            cacheTtl: 0,
            cacheEverything: false
         }
      })

      const responseHeaders = new Headers(upstream.headers)

      responseHeaders.delete("Content-Security-Policy")
      responseHeaders.delete("X-Frame-Options")
      responseHeaders.delete("Strict-Transport-Security")

      responseHeaders.set("Access-Control-Allow-Origin", "*")
      responseHeaders.set("Access-Control-Allow-Methods", "*")
      responseHeaders.set("Access-Control-Allow-Headers", "*")

      return new Response(upstream.body, {
         status: upstream.status,
         statusText: upstream.statusText,
         headers: responseHeaders
      })

   } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
         status: 500,
         headers: { "Content-Type": "application/json" }
      })
   }
})