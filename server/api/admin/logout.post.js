import { clearAdminCookie } from '../../utils/admin-auth.js'
import appConfig from '../../utils/app-config.js'

export default defineEventHandler((event) => {
   clearAdminCookie(event)
   return {
      creator: appConfig.watermark.creator,
      status: true,
      msg: 'Logout successfully'
   }
})
