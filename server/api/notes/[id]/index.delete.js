import { getCloudflareEnv } from '../../../utils/cloudflare.js'
import { requireAdmin } from '../../../utils/admin-auth.js'
import { deleteNote } from '../../../utils/database.js'
export default defineEventHandler(async (event) => {
   await requireAdmin(event)
   await deleteNote(getCloudflareEnv(event).DB, getRouterParam(event, 'id'))
   return { status: true }
})
