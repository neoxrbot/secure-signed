import { getCloudflareEnv } from '../../utils/cloudflare.js'
import { requireAdmin } from '../../utils/admin-auth.js'
import { createNote } from '../../utils/database.js'
const makeId = () => Math.random().toString(36).slice(2, 10)
export default defineEventHandler(async (event) => {
   await requireAdmin(event)
   const env = getCloudflareEnv(event)
   const body = await readBody(event)
   const title = String(body?.title || '').trim()
   const content = String(body?.content || '').trim()
   if (!title || !content) throw createError({ statusCode: 400, statusMessage: 'Title and content are required' })
   const note = await createNote(env.DB, { id: makeId(), title, content, isPrivate: !!body?.is_private })
   return { status: true, data: note }
})
