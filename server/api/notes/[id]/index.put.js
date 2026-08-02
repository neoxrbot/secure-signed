import { getCloudflareEnv } from '../../../utils/cloudflare.js'
import { requireAdmin } from '../../../utils/admin-auth.js'
import { updateNote } from '../../../utils/database.js'
export default defineEventHandler(async (event) => {
   await requireAdmin(event)
   const env = getCloudflareEnv(event)
   const id = getRouterParam(event, 'id')
   const body = await readBody(event)
   const note = await updateNote(env.DB, id, { title: String(body?.title || '').trim(), content: String(body?.content || '').trim(), isPrivate: !!body?.is_private })
   return { status: true, data: note }
})
