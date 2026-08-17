import { getCloudflareEnv, jsonResponse } from '../../utils/index.js'
import { isAdmin } from '../../utils/admin-auth.js'
import { createNote } from '../../utils/database.js'
import appConfig from '../../utils/app-config.js'

function generateId(length = 10) {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   let res = ''
   for (let i = 0; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length))
   return res
}

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const db = env?.DB

   const admin = await isAdmin(event)
   if (!admin)
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         message: 'Unauthorized'
      }, 401)

   const body = await readBody(event) || {}
   if (!body.title || !body.content)
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         message: 'Title and content are required'
      }, 400)

   try {
      const id = body.id || generateId(10)
      const note = await createNote(db, {
         id,
         title: body.title,
         content: body.content,
         thumbnail: body.thumbnail,
         tags: body.tags,
         isPrivate: body.is_private
      })

      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: true,
         data: note
      }, 400)
   } catch (err) {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         message: err.message
      }, 500)
   }
})