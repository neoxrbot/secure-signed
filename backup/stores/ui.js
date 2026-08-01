import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
   const isInitialLoading = ref(true)

   function setInitialLoading(status) {
      isInitialLoading.value = status
   }

   return {
      isInitialLoading,
      setInitialLoading
   }
})