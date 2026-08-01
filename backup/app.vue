<template>
   <div>
      <NuxtLayout>
         <NuxtPage />
      </NuxtLayout>
   </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

useHead({
   titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - Securly Sign` : 'Securly Sign - Security & CDN Utilities'
   },
   meta: [
      { name: 'description', content: 'Fast, secure, and ephemeral file sharing, web proxy, and signed CDN platform.' }
   ]
})

onMounted(() => {
   uiStore.setInitialLoading(false)
})
</script>