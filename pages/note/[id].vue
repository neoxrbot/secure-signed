<template>
   <div class="container px-3 mb-5">
      <div class="reader-max-width mx-auto">
         <div class="note-reader-card">
            <div v-if="pending" class="p-3 p-md-4">
               <div class="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                  <div class="skeleton-btn"></div>
                  <div class="skeleton-pill"></div>
                  <div class="skeleton-btn"></div>
               </div>
               <div class="skeleton-title mb-2" style="width: 80%;"></div>
               <div class="skeleton-title mb-3" style="width: 50%;"></div>
               <div class="skeleton-meta mb-3"></div>
               <div class="d-flex flex-column gap-2 mb-3">
                  <div class="skeleton-line" style="width: 100%;"></div>
                  <div class="skeleton-line" style="width: 90%;"></div>
                  <div class="skeleton-line" style="width: 95%;"></div>
                  <div class="skeleton-line" style="width: 70%;"></div>
               </div>
               <div class="skeleton-image mb-3"></div>
            </div>

            <div v-else-if="error" class="p-4 p-md-5 text-center">
               <div class="error-icon-circle mb-3">
                  <i class="bi bi-exclamation-octagon"></i>
               </div>
               <h6 class="fw-bold text-color mb-1">Unable to Load Note</h6>
               <p class="fs-xs text-muted mb-3">{{ error }}</p>
               <button class="btn btn-sm btn-custom-accent px-3" @click="goBack">
                  Return
               </button>
            </div>

            <article v-else>
               <div class="card-header-bar p-3 border-bottom d-flex align-items-center justify-content-between gap-2">
                  <button class="btn btn-sm btn-outline-secondary btn-action-pill" @click="goBack" title="Back">
                     <i class="bi bi-arrow-left"></i>
                     <span class="d-none d-sm-inline ms-1">Back</span>
                  </button>

                  <div class="d-flex align-items-center">
                     <span v-if="note.is_private" class="pill-badge private">
                        <i class="bi bi-lock-fill me-1"></i>Private
                     </span>
                     <span v-else class="pill-badge public">
                        <i class="bi bi-globe me-1"></i>Public
                     </span>
                  </div>

                  <button class="btn btn-sm btn-outline-secondary btn-action-pill" @click="copyShareLink"
                     title="Share Note">
                     <i :class="copyStatus === 'Copied!' ? 'bi bi-check-lg text-success' : 'bi bi-share'"></i>
                     <span class="d-none d-sm-inline ms-1">{{ copyStatus }}</span>
                  </button>
               </div>

               <div class="p-3 p-md-4">
                  <h1 class="article-title mb-2 text-color">{{ note.title }}</h1>

                  <div class="d-flex align-items-center gap-2 fs-xs text-muted flex-wrap mb-3 pb-3 border-bottom">
                     <span><i class="bi bi-eye me-1 opacity-75"></i>{{ note.reads || 0 }} reads</span>
                     <span>•</span>
                     <span><i class="bi bi-clock me-1 opacity-75"></i>{{ readingTime }} min read</span>
                     <span>•</span>
                     <span><i class="bi bi-calendar3 me-1 opacity-75"></i>{{ formatDate(note.created_at) }}</span>
                  </div>

                  <div class="markdown-body" v-html="html"></div>
               </div>
            </article>
         </div>
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
const copyStatus = ref('Share')

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const html = computed(() => md.render(note.value.content || ''))

const readingTime = computed(() => {
   const words = (note.value.content || '').trim().split(/\s+/).length
   return Math.max(1, Math.ceil(words / 200))
})

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
      setTimeout(() => { copyStatus.value = 'Share' }, 2000)
   } catch { }
}

const formatDate = (v: number | string) => {
   if (!v) return '-'
   return new Date(v).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
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
   font-size: 0.725rem;
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

.reader-max-width {
   max-width: 780px;
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

.card-header-bar {
   background-color: var(--app-bg);
}

.btn-action-pill {
   font-size: 0.75rem;
   padding: 0.25rem 0.6rem;
   border-radius: 0.375rem;
   display: inline-flex;
   align-items: center;
}

.article-title {
   font-size: 1.5rem;
   font-weight: 700;
   line-height: 1.3;
   letter-spacing: -0.01em;
}

.pill-badge {
   display: inline-flex;
   align-items: center;
   font-size: 0.65rem;
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
   width: 46px;
   height: 46px;
   margin: 0 auto;
   border-radius: 50%;
   background-color: rgba(220, 53, 69, 0.1);
   border: 1px solid rgba(220, 53, 69, 0.2);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.3rem;
   color: #dc3545;
}

.skeleton-btn,
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

.skeleton-btn {
   width: 60px;
   height: 28px;
}

.skeleton-pill {
   width: 70px;
   height: 20px;
}

.skeleton-title {
   height: 24px;
}

.skeleton-meta {
   width: 160px;
   height: 14px;
}

.skeleton-line {
   height: 14px;
}

.skeleton-image {
   width: 100%;
   height: 180px;
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
   font-size: 0.925rem;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
   color: var(--app-text-color);
   font-weight: 700;
   margin-top: 1.4rem;
   margin-bottom: 0.75rem;
   line-height: 1.3;
}

.markdown-body :deep(p) {
   margin-bottom: 1rem;
}

.markdown-body :deep(a) {
   color: var(--app-accent-color);
   text-decoration: underline;
   text-underline-offset: 3px;
}

.markdown-body :deep(code) {
   background-color: var(--app-bg);
   color: var(--app-accent-color);
   padding: 0.15rem 0.35rem;
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
   margin-top: 1rem;
   margin-bottom: 1rem;
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