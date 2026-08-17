import { isAdmin } from '../../utils/admin-auth.js'
import appConfig from '../../utils/app-config.js'

export default defineEventHandler(async (event) => ({
   creator: appConfig.watermark.creator,
   status: true,
   data: {
      admin: await isAdmin(event)
   }
}))
