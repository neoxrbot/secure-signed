import { getCloudflareEnv, jsonResponse } from '../../utils/index.js'
import { setAdminCookie } from '../../utils/admin-auth.js'
import appConfig from '../../utils/app-config.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const body = await readBody(event)
   const pin = String(body?.pin || '')

   if (!/^\d{6}$/.test(pin))
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: 'PIN must be 6 digits'
      }, 400)

   if (!env.ADMIN_PIN || pin !== String(env.ADMIN_PIN))
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: 'Invalid admin PIN'
      }, 401)


   await setAdminCookie(event)

   return jsonResponse(event, {
      creator: appConfig.watermark.creator,
      status: true,
      data: { admin: true }
   })
})
