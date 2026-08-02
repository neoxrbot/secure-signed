import { getCloudflareEnv } from '../../utils/cloudflare.js'
import { isAdmin } from '../../utils/admin-auth.js'
import { listNotes } from '../../utils/database.js'
export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const query = getQuery(event)
   const publicOnly = query.public === '1' || query.public === 'true'
   const admin = publicOnly ? false : await isAdmin(event)
   const limit = publicOnly ? 5 : 50
   const notes = await listNotes(env.DB, { includePrivate: admin, limit })
   return { status: true, data: notes }
})
