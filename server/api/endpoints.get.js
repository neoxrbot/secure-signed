export default defineEventHandler((event) => {
   // Pindai semua file di folder server/api
   const files = import.meta.glob('./**/*.{js,ts}', { eager: true })

   const endpoints = []

   for (const filePath in files) {
      // Abaikan file listing ini sendiri
      if (filePath.includes('endpoints.get.js')) continue

      const fileModule = files[filePath]

      // Ambil meta jika ada, atau gunakan object kosong jika TIDAK ADA
      const meta = fileModule.meta || {}

      // 1. Ekstrak Path (contoh: ./instagram/profile.get.js -> /api/instagram/profile)
      const cleanPath = filePath
         .replace(/^\.\//, '/api/')
         .replace(/\.(get|post|put|delete|patch)\.(js|ts)$/, '')
         .replace(/\.(js|ts)$/, '')

      // 2. Ekstrak HTTP Method (GET, POST, PUT, DELETE, dll)
      const methodMatch = filePath.match(/\.(get|post|put|delete|patch)\.(js|ts)$/)
      const method = methodMatch ? methodMatch[1].toUpperCase() : 'ALL'

      // 3. LOGIK FALLBACK OTOMATIS (Jika 'meta' tidak diisi)
      const pathSegments = cleanPath.replace('/api/', '').split('/')

      // Kategori otomatis dari nama folder (misal: /api/instagram/profile -> "Instagram")
      const defaultCategory = pathSegments.length > 1
         ? capitalize(pathSegments[0])
         : 'General'

      // Nama otomatis dari nama file (misal: profile -> "Profile" atau user-detail -> "User Detail")
      const rawName = pathSegments[pathSegments.length - 1].replace(/[-_]/g, ' ')
      const defaultName = capitalize(rawName)

      // Push ke array
      endpoints.push({
         path: cleanPath,
         method: method,
         category: meta.category || defaultCategory, // Pakai meta.category jika ada, jika tidak pakai default
         name: meta.name || defaultName,             // Pakai meta.name jika ada, jika tidak pakai default
         description: meta.description || '',
         ...meta // Ambil field kustom lainnya jika diisi di meta
      })
   }

   return {
      status: true,
      total: endpoints.length,
      endpoints: endpoints
   }
})

// Helper sederhana untuk mengubah huruf pertama jadi Kapital (contoh: "instagram" -> "Instagram")
function capitalize(str) {
   if (!str) return ''
   return str.charAt(0).toUpperCase() + str.slice(1)
}