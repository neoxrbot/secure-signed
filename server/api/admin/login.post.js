import { getCloudflareEnv } from '../../utils/index.js'
import { setAdminCookie } from '../../utils/admin-auth.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const body = await readBody(event)
   const pin = String(body?.pin || '')
   if (!/^\d{6}$/.test(pin)) throw createError({ statusCode: 400, statusMessage: 'PIN must be 6 digits' })
   if (!env.ADMIN_PIN || pin !== String(env.ADMIN_PIN)) throw createError({ statusCode: 401, statusMessage: 'Invalid admin PIN' })
   await setAdminCookie(event)
   return { status: true, data: { admin: true } }
})
