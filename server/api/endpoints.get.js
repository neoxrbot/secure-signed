export default defineEventHandler((event) => {
   const config = useRuntimeConfig(event)
   const endpoints = config.endpointsList || []

   return {
      status: true,
      total: endpoints.length,
      endpoints: endpoints
   }
})