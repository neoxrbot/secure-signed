import { getCloudflareEnv, jsonResponse } from './index.js'
import appConfig from './app-config.js'

export function defineApi(options) {
   const properties = options.properties || {}
   const execution = options.execution || options.handler

   return defineEventHandler(async (event) => {
      // 1. CEK STATUS ERROR / MAINTENANCE
      if (properties.error) {
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'Endpoint ini sedang dalam perbaikan / maintenance'
         }, 503)
      }

      // 2. CEK PREMIUM (API KEY)
      if (properties.premium) {
         const query = getQuery(event)
         const apiKeyHeader = getHeader(event, 'x-apikey')
         const userApiKey = query.apikey || apiKeyHeader

         const env = getCloudflareEnv(event) || {}
         // Mengambil API_KEY dari environment variable Cloudflare Workers
         const validApiKey = env.API_KEY || process.env.API_KEY || 'SECRET_KEY_ANDA'

         if (!userApiKey || userApiKey !== validApiKey) {
            return jsonResponse(event, {
               creator: appConfig.watermark.creator,
               status: false,
               msg: 'Akses ditolak. Silahkan sertakan ?apikey= atau header x-apikey yang valid'
            }, 401)
         }
      }

      // 3. CEK PARAMETER WAJIB
      if (properties.parameter && Array.isArray(properties.parameter) && properties.parameter.length > 0) {
         const query = getQuery(event)
         const missingParams = []

         for (const param of properties.parameter) {
            if (!query[param] || String(query[param]).trim() === '') {
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

      return execution(event)
   })
}