import { getCloudflareEnv } from '../../utils/cloudflare.js'
import { recordHit } from '../../utils/database.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const params = event.context.params || {}
   const telegramFileId = params.id
   const db = env.DB

   if (!telegramFileId) {
      return new Response(JSON.stringify({ status: false, msg: 'File ID is required' }), { status: 400 })
   }

   try {
      const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/getFile?file_id=${telegramFileId}`)
      const tgData = await tgRes.json()

      if (!tgData.ok || !tgData.result?.file_path) {
         return new Response(JSON.stringify({ status: false, msg: 'File not found or expired on Telegram' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
         })
      }

      const filePath = tgData.result.file_path
      const fileSize = tgData.result.file_size || 0
      const fileStreamUrl = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${filePath}`

      const upstreamRes = await fetch(fileStreamUrl)
      if (!upstreamRes.ok) {
         return new Response('Failed fetching file content from storage', { status: 502 })
      }

      await recordHit(db, {
         'stats:total_download_size': fileSize
      })

      const headers = new Headers(upstreamRes.headers)
      const filename = filePath.split('/').pop() || 'file'

      headers.set('Content-Disposition', `inline; filename="${filename}"`)
      headers.delete('Access-Control-Allow-Origin')

      return new Response(upstreamRes.body, {
         status: upstreamRes.status,
         headers
      })

   } catch (err) {
      return new Response(JSON.stringify({ status: false, msg: err.message }), {
         status: 500,
         headers: { 'Content-Type': 'application/json' }
      })
   }
})