import { getCloudflareEnv } from '../../../utils/cloudflare.js'
import { isAdmin } from '../../../utils/admin-auth.js'
import { updateNote } from '../../../utils/database.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const params = event.context.params || {}
   const id = params.id
   const db = env?.DB

   const admin = await isAdmin(event)
   if (!admin) {
      setResponseStatus(event, 401)
      return { status: false, message: 'Unauthorized' }
   }

   const body = await readBody(event) || {}

   try {
      const note = await updateNote(db, id, {
         title: body.title,
         content: body.content,
         thumbnail: body.thumbnail,
         tags: body.tags,
         isPrivate: body.is_private
      })

      return { status: true, data: note }
   } catch (err) {
      setResponseStatus(event, 500)
      return { status: false, message: err.message }
   }
})