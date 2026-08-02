import { clearAdminCookie } from '../../utils/admin-auth.js'
export default defineEventHandler((event) => {
   clearAdminCookie(event)
   return { status: true }
})
