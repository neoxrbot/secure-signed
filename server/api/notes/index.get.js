import { getCloudflareEnv } from '../../utils/cloudflare.js'
import { isAdmin } from '../../utils/admin-auth.js'
import { countNotes, listNotes } from '../../utils/database.js'
export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const query = getQuery(event)
   const publicOnly = query.public === '1' || query.public === 'true'
   const admin = publicOnly ? false : await isAdmin(event)
   const page = Math.max(parseInt(String(query.page || '1'), 10) || 1, 1)
   const perPage = publicOnly ? 4 : Math.min(Math.max(parseInt(String(query.per_page || '10'), 10) || 10, 1), 50)
   const total = await countNotes(env.DB, { includePrivate: admin })
   const totalPages = Math.max(Math.ceil(total / perPage), 1)
   const offset = (Math.min(page, totalPages) - 1) * perPage
   const notes = await listNotes(env.DB, { includePrivate: admin, limit: perPage, offset })
   return { status: true, data: notes, meta: { page: Math.min(page, totalPages), per_page: perPage, total, total_pages: totalPages } }
})
