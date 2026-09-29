import { getCloudflareEnv, jsonResponse } from '../utils/index.js'
import appConfig from '../utils/app-config.js'

export default defineEventHandler(async (event) => {
   const url = getRequestURL(event)

   const pathname = url.pathname
      .toLowerCase()
      .replace(/\/$/, '')

   if (
      !pathname.startsWith('/api') ||
      pathname === '/api/endpoints'
   ) {
      return
   }

   const config = useRuntimeConfig(event)
   const endpointsMap = config.endpointsMap || {}
   const endpoint = endpointsMap[pathname]

   if (!endpoint) return

   if (endpoint.error) {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: 'Endpoint ini sedang dalam perbaikan / maintenance'
      }, 503)
   }

   const query = getQuery(event)

   let body = {}
   const method = event.method?.toUpperCase()

   if (!['GET', 'HEAD'].includes(method)) {
      try {
         body = await readBody(event) || {}
      } catch {
         body = {}
      }
   }

   const input = {
      ...query,
      ...(typeof body === 'object' && body !== null ? body : {})
   }

   if (endpoint.premium) {
      const apiKeyHeader = getHeader(event, 'x-apikey')

      const userApiKey =
         apiKeyHeader ||
         query.apikey ||
         body?.apikey

      const env = getCloudflareEnv(event) || {}

      const validApiKey =
         env.API_KEY ||
         process.env.API_KEY ||
         'SECRET_API_KEY_ANDA'

      if (!userApiKey || userApiKey !== validApiKey) {
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'Akses ditolak. Silahkan sertakan ?apikey= atau header x-apikey yang valid'
         }, 401)
      }
   }

   if (
      Array.isArray(endpoint.parameter) &&
      endpoint.parameter.length > 0
   ) {
      const missingParams = []

      for (const param of endpoint.parameter) {
         const value = input[param]

         if (
            value === undefined ||
            value === null ||
            String(value).trim() === ''
         ) {
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