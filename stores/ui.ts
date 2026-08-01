import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
   state: () => ({
      isInitialLoading: true
   }),
   actions: {
      finishInitialLoading() {
         this.isInitialLoading = false
      }
   }
})