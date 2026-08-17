import { getCloudflareEnv } from '../../../utils/index.js'
import { isAdmin } from '../../../utils/admin-auth.js'
import { getNoteById, incrementNoteReads } from '../../../utils/database.js'
import appConfig from '../../../utils/app-config.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const id = getRouterParam(event, 'id')
   const note = await getNoteById(env.DB, id)

   if (!note) throw createError({ statusCode: 404, status: false, msg: 'Note not found' })

   if (Number(note.is_private) === 1 && !(await isAdmin(event))) throw createError({ statusCode: 401, status: false, msg: 'Admin login required' })

   await incrementNoteReads(env.DB, id)

   return {
      creator: appConfig.watermark.creator,
      status: true,
      data: {
         ...note,
         reads: Number(note.reads || 0) + 1
      }
   }
})
