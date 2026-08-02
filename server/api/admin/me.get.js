import { isAdmin } from '../../utils/admin-auth.js'
export default defineEventHandler(async (event) => ({ status: true, data: { admin: await isAdmin(event) } }))
