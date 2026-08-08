import { getCloudflareEnv } from '../../utils/cloudflare.js'
import { isAdmin } from '../../utils/admin-auth.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const query = getQuery(event)
   const db = env?.DB

   if (!db) {
      return { status: false, data: [], meta: { page: 1, per_page: 5, total: 0, total_pages: 1 } }
   }

   try {
      const publicOnly = query.public === '1' || query.public === 'true'
      const admin = publicOnly ? false : await isAdmin(event)
      const page = Math.max(parseInt(String(query.page || '1'), 10) || 1, 1)
      const reqPerPage = query.per_page || query.limit || (publicOnly ? '10' : '5')
      const perPage = Math.min(Math.max(parseInt(String(reqPerPage), 10) || 5, 1), 50)
      const tag = query.tag ? String(query.tag).trim().replace(/^#/, '') : ''

      let whereClause = admin ? '1=1' : 'is_private = 0'
      const bindings = []

      if (tag) {
         whereClause += ' AND tags IS NOT NULL AND tags != "" AND (tags LIKE ? OR LOWER(tags) LIKE ?)'
         bindings.push(`%${tag}%`, `%${tag.toLowerCase()}%`)
      }

      const offset = (page - 1) * perPage

      const listSql = `SELECT id, title, content, thumbnail, tags, is_private, reads, created_at, updated_at FROM notes WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
      const countSql = `SELECT COUNT(*) AS total FROM notes WHERE ${whereClause}`

      const [listRes, countRes] = await Promise.all([
         db.prepare(listSql).bind(...bindings, perPage, offset).all(),
         db.prepare(countSql).bind(...bindings).first()
      ])

      const notes = listRes?.results || []
      const total = Number(countRes?.total || 0)
      const totalPages = Math.max(Math.ceil(total / perPage), 1)

      return {
         status: true,
         data: notes,
         meta: {
            page: Math.min(page, totalPages),
            per_page: perPage,
            total,
            total_pages: totalPages
         }
      }
   } catch (err) {
      return { status: false, data: [], meta: { page: 1, per_page: 5, total: 0, total_pages: 1 } }
   }
})