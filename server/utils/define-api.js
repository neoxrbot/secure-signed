import { getCloudflareEnv, jsonResponse } from './index.js'

export function defineApi(options) {
   const meta = options.meta || {}
   const handler = options.handler

   return defineEventHandler(async (event) => {
      // 1. CEK STATUS ERROR / MAINTENANCE
      if (meta.error) {
         return jsonResponse(event, {
            status: false,
            msg: 'Endpoint ini sedang dalam perbaikan / maintenance'
         }, 503)
      }

      // 2. CEK PREMIUM (API KEY)
      if (meta.premium) {
         const query = getQuery(event)
         const apiKeyHeader = getHeader(event, 'x-apikey')
         const userApiKey = query.apikey || apiKeyHeader

         const env = getCloudflareEnv(event) || {}
         // Mengambil API_KEY dari environment variable Cloudflare Workers
         const validApiKey = env.API_KEY || process.env.API_KEY || 'SECRET_KEY_ANDA'

         if (!userApiKey || userApiKey !== validApiKey) {
            return jsonResponse(event, {
               status: false,
               msg: 'Akses ditolak. Silahkan sertakan ?apikey= atau header x-apikey yang valid'
            }, 401)
         }
      }

      // 3. CEK PARAMETER WAJIB
      if (meta.parameter && Array.isArray(meta.parameter) && meta.parameter.length > 0) {
         const query = getQuery(event)
         const missingParams = []

         for (const param of meta.parameter) {
            if (!query[param] || String(query[param]).trim() === '') {
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

      // Jika semua pengecekan valid, jalankan handler utama
      return handler(event)
   })
}