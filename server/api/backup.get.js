import { getCloudflareEnv } from '../utils/cloudflare.js'

function escapeSqlValue(val) {
   if (val === null || val === undefined) return 'NULL'
   if (typeof val === 'number') return val.toString()
   if (typeof val === 'boolean') return val ? '1' : '0'
   const str = String(val).replace(/'/g, "''")
   return `'${str}'`
}

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const query = getQuery(event)
   const db = env?.DB

   const secret = query.secret
   const expectedSecret = env?.CRON_SECRET || env?.ADMIN_SECRET || env?.SECRET

   if (!expectedSecret || secret !== expectedSecret) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid secret token' })
   }

   if (!db) {
      throw createError({ statusCode: 500, statusMessage: 'Database D1 binding not found' })
   }

   try {
      const now = new Date()
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const fileName = `d1_backup_${dateStr}.sql`

      let sqlDump = `-- ==========================================\n`
      sqlDump += `-- Cloudflare D1 Database Dump\n`
      sqlDump += `-- Export Date: ${now.toISOString()}\n`
      sqlDump += `-- ==========================================\n\n`
      sqlDump += `PRAGMA foreign_keys = OFF;\n`
      sqlDump += `BEGIN TRANSACTION;\n\n`

      const { results: schemaResults } = await db.prepare(
         `SELECT type, name, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY type DESC, name ASC`
      ).all()

      const tables = (schemaResults || []).filter(item => item.type === 'table')

      for (const table of tables) {
         sqlDump += `-- Table: ${table.name}\n`
         if (table.sql) {
            sqlDump += `${table.sql};\n`
         }

         const { results: rows } = await db.prepare(`SELECT * FROM "${table.name}"`).all()

         if (rows && rows.length > 0) {
            const cols = Object.keys(rows[0]).map(c => `"${c}"`).join(', ')
            for (const row of rows) {
               const vals = Object.values(row).map(escapeSqlValue).join(', ')
               sqlDump += `INSERT INTO "${table.name}" (${cols}) VALUES (${vals});\n`
            }
         }
         sqlDump += `\n`
      }

      const otherSchema = (schemaResults || []).filter(item => item.type !== 'table')
      if (otherSchema.length > 0) {
         sqlDump += `-- Indexes & Triggers\n`
         for (const item of otherSchema) {
            if (item.sql) sqlDump += `${item.sql};\n`
         }
         sqlDump += `\n`
      }

      sqlDump += `COMMIT;\n`

      setHeader(event, 'Content-Type', 'text/x-sql; charset=utf-8')
      setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`)
      setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')

      return sqlDump
   } catch (err) {
      throw createError({ statusCode: 500, statusMessage: `Backup failed: ${err.message}` })
   }
})