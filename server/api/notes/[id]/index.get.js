import { getCloudflareEnv } from '../../../utils/index.js'
import { isAdmin } from '../../../utils/admin-auth.js'
import { getNoteById, incrementNoteReads } from '../../../utils/database.js'
import appConfig from '../../../utils/index.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const id = getRouterParam(event, 'id')
   const note = await getNoteById(env.DB, id)

   if (!note) throw createError({ statusCode: 404, statusMessage: 'Note not found' })

   if (Number(note.is_private) === 1 && !(await isAdmin(event))) throw createError({ statusCode: 401, statusMessage: 'Admin login required' })

   await incrementNoteReads(env.DB, id)

   return {
      creator: appConfig.watermwak.creator,
      status: true,
      data: {
         ...note,
         reads: Number(note.reads || 0) + 1
      }
   }
})
