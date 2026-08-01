import NProgress from 'nprogress'
import { useUiStore } from '@/stores/ui'
import type { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
   const router = useRouter()

   const uiStore = useUiStore(nuxtApp.$pinia as Pinia)

   NProgress.configure({ showSpinner: false })

   router.beforeEach(() => {
      if (uiStore.isInitialLoading) {
         return
      }

      NProgress.start()
   })

   router.afterEach(() => {
      NProgress.done()
   })
})