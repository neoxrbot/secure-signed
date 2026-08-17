import { getCloudflareEnv, jsonResponse } from '../../../utils/index.js'
import { isAdmin } from '../../../utils/admin-auth.js'
import { updateNote } from '../../../utils/database.js'
import appConfig from '../../../utils/app-config.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const params = event.context.params || {}
   const id = params.id
   const db = env?.DB

   const admin = await isAdmin(event)
   if (!admin)
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: 'Unauthorized'
      }, 401)

   const body = await readBody(event) || {}

   try {
      const note = await updateNote(db, id, {
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
      })
   } catch (err) {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: err.message
      }, 500)
   }
})