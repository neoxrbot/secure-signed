import { getCloudflareEnv } from '../../utils/cloudflare.js'
import { isAdmin } from '../../utils/admin-auth.js'
import { createNote } from '../../utils/database.js'

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
   if (!admin) {
      setResponseStatus(event, 401)
      return { status: false, message: 'Unauthorized' }
   }

   const body = await readBody(event) || {}
   if (!body.title || !body.content) {
      setResponseStatus(event, 400)
      return { status: false, message: 'Title and content are required' }
   }

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

      return { status: true, data: note }
   } catch (err) {
      setResponseStatus(event, 500)
      return { status: false, message: err.message }
   }
})