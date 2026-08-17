import { getCloudflareEnv } from '../../../utils/index.js'
import { deleteNote } from '../../../utils/database.js'
import { requireAdmin } from '../../../utils/admin-auth.js'
import appConfig from '../../../utils/app-config.js'

export default defineEventHandler(async (event) => {
   await requireAdmin(event)
   await deleteNote(getCloudflareEnv(event).DB, getRouterParam(event, 'id'))
   return {
      creator: appConfig.watermark.creator,
      status: true,
      msg: 'Note deleted successfully'
   }
})