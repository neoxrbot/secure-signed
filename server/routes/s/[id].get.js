import { getCloudflareEnv } from '../../utils/cloudflare.js'
import { getShortUrl, incrementShortUrlView } from '../../utils/database.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const params = event.context.params || {}
   const shortId = params.id
   const db = env.DB

   const urlRow = await getShortUrl(db, shortId)

   if (!urlRow) return new Response('URL Shortener link not found', { status: 404 })

   await incrementShortUrlView(db, shortId)

   return Response.redirect(urlRow.url, 302)
})