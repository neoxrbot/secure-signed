import { getCloudflareEnv } from '../utils/cloudflare.js'

export default defineEventHandler(async (event) => {
   const query = getQuery(event)
   const env = getCloudflareEnv(event)

   if (query.secret !== env.CRON_SECRET) {
      throw createError({
         statusCode: 401,
         statusMessage: 'Unauthorized'
      })
   }

   const db = env.DB

   const tables = await db.prepare(`
    SELECT name, sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all()

   const output = []

   output.push('-- D1 SQLite Backup')
   output.push(`-- Created: ${new Date().toISOString()}`)
   output.push('PRAGMA foreign_keys=OFF;')
   output.push('BEGIN TRANSACTION;')
   output.push('')

   for (const table of tables.results) {
      const tableName = table.name

      // CREATE TABLE
      if (table.sql) {
         output.push(`${table.sql};`)
         output.push('')
      }

      // Ambil data
      const rows = await db
         .prepare(`SELECT * FROM "${tableName.replaceAll('"', '""')}"`)
         .all()

      for (const row of rows.results) {
         const columns = Object.keys(row)

         const values = columns.map((column) => {
            const value = row[column]

            if (value === null || value === undefined) {
               return 'NULL'
            }

            if (typeof value === 'number') {
               return String(value)
            }

            if (typeof value === 'boolean') {
               return value ? '1' : '0'
            }

            return `'${String(value)
               .replaceAll('\\', '\\\\')
               .replaceAll("'", "''")}'`
         })

         const columnSql = columns
            .map((column) => `"${column.replaceAll('"', '""')}"`)
            .join(', ')

         output.push(
            `INSERT INTO "${tableName.replaceAll('"', '""')}" (${columnSql}) VALUES (${values.join(', ')});`
         )
      }

      output.push('')
   }

   output.push('COMMIT;')
   output.push('PRAGMA foreign_keys=ON;')

   const sql = output.join('\n')

   const filename = `d1-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.sql`

   setHeader(event, 'Content-Type', 'application/sql; charset=utf-8')
   setHeader(
      event,
      'Content-Disposition',
      `attachment; filename="${filename}"`
   )
   setHeader(event, 'Content-Length', String(new TextEncoder().encode(sql).length))

   return sql
})