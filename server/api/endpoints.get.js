export default defineEventHandler((event) => {
   try {
      // 1. Menggunakan array glob & '!./endpoints.get.js' untuk MENCEGAH circular import
      const files = import.meta.glob(['./**/*.{js,ts}', '!./endpoints.get.js'], { eager: true })

      const endpoints = []

      for (const filePath in files) {
         const fileModule = files[filePath]
         if (!fileModule) continue

         const meta = fileModule.meta || {}

         // 2. Cleaning Path yang aman untuk Cloudflare Workers/Vite
         let cleanPath = filePath
            .replace(/^(\.\/|\/server\/api\/)/, '/api/')
            .replace(/\.(get|post|put|delete|patch)\.(js|ts)$/, '')
            .replace(/\.(js|ts)$/, '')

         if (!cleanPath.startsWith('/api/')) {
            cleanPath = '/api/' + cleanPath.replace(/^\//, '')
         }

         // 3. Ambil HTTP Method
         const methodMatch = filePath.match(/\.(get|post|put|delete|patch)\.(js|ts)$/)
         const method = methodMatch ? methodMatch[1].toUpperCase() : 'ALL'

         // 4. Parsing Fallback Kategori & Nama secara defensif
         const relativePath = cleanPath.replace(/^\/api\/?/, '')
         const pathSegments = relativePath ? relativePath.split('/') : []

         const defaultCategory = pathSegments.length > 1 && pathSegments[0]
            ? capitalize(pathSegments[0])
            : 'General'

         const rawName = pathSegments.length > 0 && pathSegments[pathSegments.length - 1]
            ? pathSegments[pathSegments.length - 1].replace(/[-_]/g, ' ')
            : 'Index'
         const defaultName = capitalize(rawName)

         endpoints.push({
            path: cleanPath,
            method: method,
            category: meta.category || defaultCategory,
            name: meta.name || defaultName,
            description: meta.description || '',
            ...meta
         })
      }

      return {
         status: true,
         total: endpoints.length,
         endpoints: endpoints
      }
   } catch (err) {
      // Jika terjadi error, kita tangkap dan tampilkan pesan aslinya agar tidak jadi 500 polos
      setResponseStatus(event, 500)
      return {
         status: false,
         msg: err.message || 'Internal Server Error',
         error: String(err)
      }
   }
})

function capitalize(str) {
   if (!str) return ''
   return str.charAt(0).toUpperCase() + str.slice(1)
}