<template>
   <div class="container px-3 mb-5">
      <div class="mb-3 d-flex align-items-center justify-content-between">
         <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5" @click="goBack">
            <i class="bi bi-arrow-left"></i>
            <span>Back</span>
         </button>

         <button v-if="!pending && !error"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5" @click="copyShareLink">
            <i :class="copyStatus === 'Copied!' ? 'bi bi-check-lg text-success' : 'bi bi-share'"></i>
            <span>{{ copyStatus }}</span>
         </button>
      </div>

      <div class="note-reader-card">
         <div v-if="pending" class="p-4 p-md-5">
            <div class="mb-4 pb-3 border-bottom">
               <div class="skeleton-pill mb-3"></div>
               <div class="skeleton-title mb-2" style="width: 85%;"></div>
               <div class="skeleton-title mb-3" style="width: 55%;"></div>
               <div class="skeleton-meta"></div>
            </div>

            <div class="d-flex flex-column gap-2 mb-4">
               <div class="skeleton-line" style="width: 100%;"></div>
               <div class="skeleton-line" style="width: 92%;"></div>
               <div class="skeleton-line" style="width: 96%;"></div>
               <div class="skeleton-line" style="width: 78%;"></div>
            </div>

            <div class="skeleton-image mb-4"></div>

            <div class="d-flex flex-column gap-2">
               <div class="skeleton-line" style="width: 100%;"></div>
               <div class="skeleton-line" style="width: 88%;"></div>
               <div class="skeleton-line" style="width: 60%;"></div>
            </div>
         </div>

         <div v-else-if="error" class="p-5 text-center">
            <div class="error-icon-circle mb-3">
               <i class="bi bi-exclamation-octagon"></i>
            </div>
            <h5 class="fw-bold text-color mb-1">Unable to Load Note</h5>
            <p class="fs-xs text-muted mb-3">{{ error }}</p>
            <button class="btn btn-sm btn-custom-accent px-3" @click="goBack">
               Return
            </button>
         </div>

         <article v-else class="p-4 p-md-5">
            <header class="mb-4 pb-3 border-bottom">
               <div class="d-flex align-items-center gap-2 mb-2">
                  <span v-if="note.is_private" class="pill-badge private">
                     <i class="bi bi-lock-fill me-1"></i>Private Note
                  </span>
                  <span v-else class="pill-badge public">
                     <i class="bi bi-globe me-1"></i>Public Note
                  </span>
               </div>

               <h1 class="article-title mb-3 text-color">{{ note.title }}</h1>

               <div class="d-flex align-items-center gap-3 fs-xs text-muted flex-wrap">
                  <span><i class="bi bi-eye me-1 opacity-75"></i>{{ note.reads || 0 }} reads</span>
                  <span>•</span>
                  <span><i class="bi bi-calendar3 me-1 opacity-75"></i>{{ formatDate(note.created_at) }}</span>
               </div>
            </header>

            <div class="markdown-body" v-html="html"></div>
         </article>
      </div>
   </div>
</template>

<script setup lang="ts">
import MarkdownIt from '@/utils/markdown-it'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, useNuxtApp, useHead } from '#app'

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()

const note = ref<any>({})
const pending = ref(true)
const error = ref('')
const copyStatus = ref('Share Link')

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const html = computed(() => md.render(note.value.content || ''))

useHead({
   title: computed(() => note.value.title ? `${note.value.title} - Note Reader` : 'Note Reader')
})

const playClickSound = () => {
   try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.035)
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.035)
   } catch { }
}

const goBack = () => {
   playClickSound()
   if (window.history.length > 1) {
      router.back()
   } else {
      router.push('/')
   }
}

const copyShareLink = async () => {
   playClickSound()
   try {
      await navigator.clipboard.writeText(window.location.href)
      copyStatus.value = 'Copied!'
      setTimeout(() => { copyStatus.value = 'Share Link' }, 2000)
   } catch { }
}

const formatDate = (v: number | string) => {
   if (!v) return '-'
   return new Date(v).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
   })
}

onMounted(async () => {
   try {
      const r = await $api(`/api/notes/${route.params.id}`)
      note.value = r.data
   } catch (e: any) {
      error.value = e.data?.message || 'Note not found or private'
   } finally {
      pending.value = false
   }
})
</script>

<style scoped>
.fs-xs {
   font-size: 0.75rem;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-accent {
   color: var(--app-accent-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.border-bottom {
   border-color: var(--app-border-color) !important;
}

.note-reader-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.625rem;
   overflow: hidden;
}

.article-title {
   font-size: 1.75rem;
   font-weight: 700;
   line-height: 1.3;
}

.pill-badge {
   display: inline-flex;
   align-items: center;
   font-size: 0.675rem;
   font-weight: 600;
   padding: 0.2rem 0.5rem;
   border-radius: 0.25rem;
}

.pill-badge.private {
   background-color: rgba(220, 53, 69, 0.15);
   color: #dc3545;
   border: 1px solid rgba(220, 53, 69, 0.25);
}

.pill-badge.public {
   background-color: rgba(25, 135, 84, 0.15);
   color: #198754;
   border: 1px solid rgba(25, 135, 84, 0.25);
}

.error-icon-circle {
   width: 50px;
   height: 50px;
   margin: 0 auto;
   border-radius: 50%;
   background-color: rgba(220, 53, 69, 0.1);
   border: 1px solid rgba(220, 53, 69, 0.2);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.5rem;
   color: #dc3545;
}

.skeleton-pill,
.skeleton-title,
.skeleton-meta,
.skeleton-line,
.skeleton-image {
   background: linear-gradient(90deg,
         var(--app-bg) 25%,
         var(--app-border-color) 50%,
         var(--app-bg) 75%);
   background-size: 200% 100%;
   animation: shimmer 1.5s infinite linear;
   border-radius: 0.375rem;
}

.skeleton-pill {
   width: 90px;
   height: 22px;
}

.skeleton-title {
   height: 28px;
}

.skeleton-meta {
   width: 180px;
   height: 16px;
}

.skeleton-line {
   height: 16px;
}

.skeleton-image {
   width: 100%;
   height: 220px;
   border-radius: 0.5rem;
}

@keyframes shimmer {
   0% {
      background-position: 200% 0;
   }

   100% {
      background-position: -200% 0;
   }
}

.markdown-body {
   color: var(--app-text-color);
   line-height: 1.7;
   font-size: 0.95rem;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
   color: var(--app-text-color);
   font-weight: 700;
   margin-top: 1.5rem;
   margin-bottom: 0.75rem;
}

.markdown-body :deep(p) {
   margin-bottom: 1rem;
}

.markdown-body :deep(a) {
   color: var(--app-accent-color);
   text-decoration: underline;
}

.markdown-body :deep(code) {
   background-color: var(--app-bg);
   color: var(--app-accent-color);
   padding: 0.2rem 0.4rem;
   border-radius: 0.25rem;
   font-size: 0.85em;
   border: 1px solid var(--app-border-color);
}

.markdown-body :deep(pre) {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   padding: 1rem;
   border-radius: 0.5rem;
   overflow-x: auto;
   margin-top: 1rem;
   margin-bottom: 1rem;
}

.markdown-body :deep(pre code) {
   background: transparent;
   padding: 0;
   border: none;
   color: inherit;
}

.markdown-body :deep(blockquote) {
   border-left: 3px solid var(--app-accent-color);
   padding-left: 1rem;
   margin-left: 0;
   color: var(--app-secondary-text-color);
   font-style: italic;
}

.markdown-body :deep(img) {
   max-width: 100%;
   height: auto;
   border-radius: 0.5rem;
   border: 1px solid var(--app-border-color);
   margin-top: 0.75rem;
   margin-bottom: 0.75rem;
}

.markdown-body :deep(table) {
   width: 100%;
   border-collapse: collapse;
   margin-top: 1rem;
   margin-bottom: 1rem;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
   border: 1px solid var(--app-border-color);
   padding: 0.5rem 0.75rem;
}

.markdown-body :deep(th) {
   background-color: var(--app-bg);
}
</style>