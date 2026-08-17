import { getCloudflareEnv, jsonResponse } from '../server/utils/index.js'

export default defineEventHandler(async (event) => {
   const url = getRequestURL(event)
   const pathname = url.pathname.replace(/\/$/, '') // Hilangkan trailing slash jika ada

   // Hanya jalankan middleware untuk jalur /api (dan abaikan endpoint listing /api/endpoints)
   if (!pathname.startsWith('/api') || pathname === '/api/endpoints') return

   const config = useRuntimeConfig(event)
   const endpointsMap = config.endpointsMap || {}

   // Cari metadata endpoint berdasarkan URL yang dipanggil
   const endpoint = endpointsMap[pathname]

   // Jika endpoint tidak terdaftar di metadata, lewati middleware
   if (!endpoint) return

   // -------------------------------------------------------------
   // 1. CEK STATUS ERROR / MAINTENANCE
   // -------------------------------------------------------------
   if (endpoint.error) {
      return jsonResponse(event, {
         status: false,
         msg: 'Endpoint ini sedang dalam perbaikan / maintenance'
      }, 503)
   }

   // -------------------------------------------------------------
   // 2. CEK PREMIUM (API KEY)
   // -------------------------------------------------------------
   if (endpoint.premium) {
      const query = getQuery(event)
      const apiKeyHeader = getHeader(event, 'x-apikey')
      const userApiKey = query.apikey || apiKeyHeader

      const env = getCloudflareEnv(event) || {}
      // Ambil API Key resmi dari Environment Variables Cloudflare Workers / .env
      const validApiKey = env.API_KEY || process.env.API_KEY || 'SECRET_API_KEY_ANDA'

      if (!userApiKey || userApiKey !== validApiKey) {
         return jsonResponse(event, {
            status: false,
            msg: 'Akses ditolak. Silahkan sertakan ?apikey= atau header x-apikey yang valid'
         }, 401)
      }
   }

   // -------------------------------------------------------------
   // 3. CEK PARAMETER WAJIB (QUERY PARAMETERS)
   // -------------------------------------------------------------
   if (endpoint.parameter && endpoint.parameter.length > 0) {
      const query = getQuery(event)
      const missingParams = []

      for (const param of endpoint.parameter) {
         if (!query[param] || query[param].trim() === '') {
            missingParams.push(param)
         }
      }

      if (missingParams.length > 0) {
         return jsonResponse(event, {
            status: false,
            msg: `Parameter wajib diisi: ${missingParams.join(', ')}`
         }, 400)
      }
   }
})