import { cleanDatabase } from '../../utils/database.js'

export default defineTask({
   meta: {
      name: 'db:cleanup',
      description: 'Menghapus token CDN kadaluwarsa dan Short URL tua'
   },
   async run({ event }) {
      const db = event.context.cloudflare?.env?.DB
      if (!db) {
         return { status: 'error', message: 'D1 Database binding tidak ditemukan' }
      }

      const stats = await cleanDatabase(db, 30)

      return {
         status: 'success',
         deleted_cdn: stats.deletedCdn,
         deleted_urls: stats.deletedUrls
      }
   }
})