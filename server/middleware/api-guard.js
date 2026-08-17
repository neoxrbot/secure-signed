import { getCloudflareEnv, jsonResponse } from '../utils/index.js'
import appConfig from '../utils/app-config.js'

export default defineEventHandler(async (event) => {
   const url = getRequestURL(event)

   // Normalisasi path: ubah ke lowercase & hilangkan trailing slash di akhir
   const pathname = url.pathname.toLowerCase().replace(/\/$/, '')

   if (!pathname.startsWith('/api') || pathname === '/api/endpoints') return

   const config = useRuntimeConfig(event)
   const endpointsMap = config.endpointsMap || {}

   // Cari endpoint berdasarkan pathname yang sudah dinormalisasi
   const endpoint = endpointsMap[pathname]

   // Jika endpoint tidak ditemukan di map, lewati
   if (!endpoint) return

   // 1. CEK ERROR / MAINTENANCE
   if (endpoint.error) {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: 'Endpoint ini sedang dalam perbaikan / maintenance'
      }, 503)
   }

   // 2. CEK PREMIUM (API KEY)
   if (endpoint.premium) {
      const query = getQuery(event)
      const apiKeyHeader = getHeader(event, 'x-apikey')
      const userApiKey = query.apikey || apiKeyHeader

      const env = getCloudflareEnv(event) || {}
      // Ambil API Key dari Environment Variables Cloudflare / .env
      const validApiKey = env.API_KEY || process.env.API_KEY || 'SECRET_API_KEY_ANDA'

      if (!userApiKey || userApiKey !== validApiKey) {
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'Akses ditolak. Silahkan sertakan ?apikey= atau header x-apikey yang valid'
         }, 401)
      }
   }

   // 3. CEK PARAMETER
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
            creator: appConfig.watermark.creator,
            status: false,
            msg: `Parameter wajib diisi: ${missingParams.join(', ')}`
         }, 400)
      }
   }
})