import { getCloudflareEnv } from '../../utils/cloudflare.js'
import { isAdmin } from '../../utils/admin-auth.js'
import { listNotes } from '../../utils/database.js'
export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const admin = await isAdmin(event)
   const notes = await listNotes(env.DB, { includePrivate: admin, limit: 50 })
   return { status: true, data: notes }
})
