import { jsonResponse } from '../utils/index.js'

export default defineEventHandler((event) => {
   const config = useRuntimeConfig(event)
   const endpoints = config.endpointsList || []

   return jsonResponse(event, {
      status: true,
      total: endpoints.length,
      endpoints: endpoints
   })
})