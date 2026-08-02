<template><div class="container px-3 mb-5"><div class="content-card p-4"><div v-if="pending">Loading...</div><div v-else-if="error" class="text-danger">{{ error }}</div><article v-else><div class="d-flex justify-content-between align-items-start gap-2 mb-3"><div><h3>{{ note.title }}</h3><div class="text-muted fs-xs">{{ note.reads }} reads • {{ formatDate(note.created_at) }} <span v-if="note.is_private">• Private</span></div></div><NuxtLink to="/admin" class="btn btn-sm btn-outline-secondary">Admin</NuxtLink></div><div class="markdown-body" v-html="html"></div></article></div></div></template>
<script setup lang="ts">
import MarkdownIt from '@/utils/markdown-it'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useNuxtApp } from '#app'
const route=useRoute(); const { $api }=useNuxtApp(); const note=ref<any>({}); const pending=ref(true); const error=ref('')
const md = new MarkdownIt({ html:false, linkify:true, breaks:true })
const html = computed(()=> md.render(note.value.content || ''))
const formatDate=(v:number)=>new Date(v).toLocaleString()
onMounted(async()=>{try{const r=await $api(`/api/notes/${route.params.id}`); note.value=r.data}catch(e:any){error.value=e.data?.message||'Note not found or private'}finally{pending.value=false}})
</script>
<style scoped>.fs-xs{font-size:.75rem}.text-muted{color:var(--app-secondary-text-color)!important}.markdown-body :deep(img){max-width:100%;border-radius:.5rem}.markdown-body :deep(a){color:var(--app-accent-color)}.markdown-body :deep(pre){background:var(--app-bg);padding:1rem;border-radius:.5rem}</style>
