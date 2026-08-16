<template>
   <div class="latest-notes-container" @mouseenter="stopAutoSlide" @mouseleave="startAutoSlide">
      <div class="d-flex align-items-center justify-content-between mb-3">
         <div class="d-flex align-items-center gap-2">
            <div class="section-icon">
               <i class="bi bi-journal-text"></i>
            </div>
            <div>
               <h6 class="fw-bold text-color mb-0">Latest Articles</h6>
            </div>
         </div>
         <div v-if="notes.length > 1" class="d-flex align-items-center gap-2">
            <button class="btn btn-icon-only" @click="prevSlide" title="Previous">
               <i class="bi bi-chevron-left"></i>
            </button>
            <div class="d-flex align-items-center gap-1">
               <span v-for="(n, idx) in notes" :key="n.id" class="dot-indicator"
                  :class="{ 'active': idx === activeIndex }" @click="goToSlide(idx)"></span>
            </div>
            <button class="btn btn-icon-only" @click="nextSlide" title="Next">
               <i class="bi bi-chevron-right"></i>
            </button>
         </div>
      </div>

      <div v-if="loading" class="skeleton-box p-3 rounded-3">
         <div class="d-flex align-items-center gap-2 mb-2">
            <div class="skeleton" style="width: 36px; height: 36px; border-radius: 6px; flex-shrink: 0;"></div>
            <div class="flex-grow-1">
               <div class="skeleton w-75 mb-1" style="height: 14px;"></div>
               <div class="skeleton w-25" style="height: 10px;"></div>
            </div>
         </div>
         <div class="skeleton w-100 mb-2" style="height: 12px;"></div>
         <div class="skeleton w-50" style="height: 12px;"></div>
      </div>

      <Transition v-else-if="activeNote" name="slide-fade" mode="out-in">
         <div :key="activeNote.id" class="note-box-card p-3 rounded-3">
            <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
               <div class="d-flex align-items-center gap-2 min-w-0 flex-grow-1">
                  <div class="note-thumb-box">
                     <img v-if="activeNote.thumbnail" :src="getThumbnailUrl(activeNote.thumbnail)"
                        class="note-thumb-img" />
                     <div v-else class="note-thumb-avatar">
                        {{ getFirstLetter(activeNote.title) }}
                     </div>
                  </div>
                  <div class="min-w-0 flex-grow-1">
                     <a :href="getArticleUrl(activeNote.id)" target="_blank" rel="noopener noreferrer"
                        class="note-slide-title fw-bold text-decoration-none text-truncate d-block"
                        :title="activeNote.title">
                        {{ activeNote.title }}
                     </a>
                     <span class="fs-xs text-muted">{{ activeNote.reads || 0 }} reads</span>
                  </div>
               </div>
               <a :href="getArticleUrl(activeNote.id)" target="_blank" rel="noopener noreferrer"
                  class="btn btn-sm btn-action-view flex-shrink-0 ms-2">
                  Read <i class="bi bi-arrow-right ms-1"></i>
               </a>
            </div>

            <p class="fs-xs text-muted note-excerpt-text">{{ noteExcerpt(activeNote.content) }}...</p>
         </div>
      </Transition>

      <div v-else
         class="note-box-card p-4 text-center text-muted fs-xs rounded-3 d-flex align-items-center justify-content-center">
         No public articles available.
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Note {
   id: string | number
   title: string
   content: string
   thumbnail?: string
   reads?: number
   tags?: string[] | string
}

const props = defineProps({
   domain: { type: String, default: 'secure-signed.pages.dev' }
})

const primaryDomain = ref(props.domain)
const notes = ref<Note[]>([])
const activeIndex = ref(0)
const loading = ref(true)
let slideTimer: ReturnType<typeof setInterval> | null = null

const activeNote = computed(() => notes.value[activeIndex.value] || null)

const getBaseUrl = () => {
   const domainStr = primaryDomain.value.trim()
   return domainStr.startsWith('http') ? domainStr : `https://${domainStr}`
}

const getArticleUrl = (id: string | number) => {
   return `${getBaseUrl()}/note/${id}`
}

const getThumbnailUrl = (thumb: string) => {
   if (!thumb) return ''
   if (thumb.startsWith('http')) return thumb
   const base = getBaseUrl()
   return thumb.startsWith('/') ? `${base}${thumb}` : `${base}/${thumb}`
}

const getFirstLetter = (title = '') => {
   const t = title.trim()
   return t ? t.charAt(0).toUpperCase() : 'N'
}

const noteExcerpt = (content = '') => {
   if (!content) return ''
   return content.replace(/[#*_`>\-!\[\]()]/g, '').slice(0, 110)
}

const fetchLatestNotes = async () => {
   loading.value = true
   try {
      const targetUrl = `${getBaseUrl()}/api/notes?public=true&limit=4`
      let endpoint = targetUrl
      if (typeof window !== 'undefined' && !targetUrl.includes(window.location.host)) {
         endpoint = `/api/proxy?url=${encodeURIComponent(targetUrl)}`
      }
      const res = await $fetch<any>(endpoint)
      const rawData = res.data || []

      notes.value = rawData.filter((n: Note) => {
         if (!n.tags) return false
         const tagList = Array.isArray(n.tags)
            ? n.tags
            : String(n.tags).split(',').map(t => t.trim().replace(/^#/, ''))
         return tagList
      }).slice(0, 6)
   } catch {
      notes.value = []
   } finally {
      loading.value = false
   }
}

const startAutoSlide = () => {
   stopAutoSlide()
   if (notes.value.length > 1) {
      slideTimer = setInterval(() => {
         nextSlide()
      }, 4500)
   }
}

const stopAutoSlide = () => {
   if (slideTimer) clearInterval(slideTimer)
}

const nextSlide = () => {
   if (!notes.value.length) return
   activeIndex.value = (activeIndex.value + 1) % notes.value.length
}

const prevSlide = () => {
   if (!notes.value.length) return
   activeIndex.value = (activeIndex.value - 1 + notes.value.length) % notes.value.length
}

const goToSlide = (idx: number) => {
   activeIndex.value = idx
   startAutoSlide()
}

onMounted(() => {
   fetchLatestNotes().then(() => {
      startAutoSlide()
   })
})

onUnmounted(() => {
   stopAutoSlide()
})
</script>

<style scoped>
.section-icon {
   width: 32px;
   height: 32px;
   display: flex;
   align-items: center;
   justify-content: center;
   background-color: var(--app-bg);
   border-radius: 0.375rem;
   border: 1px solid var(--app-border-color);
   color: var(--app-accent-color);
   font-size: 0.9rem;
}

.fs-xs {
   font-size: 0.725rem;
}

.min-w-0 {
   min-width: 0;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.note-box-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   height: 130px;
   min-height: 130px;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
}

.note-thumb-box {
   width: 36px;
   height: 36px;
   border-radius: 6px;
   overflow: hidden;
   border: 1px solid var(--app-border-color);
   background-color: var(--app-bg);
   flex-shrink: 0;
}

.note-thumb-img {
   width: 100%;
   height: 100%;
   object-fit: cover;
}

.note-thumb-avatar {
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-weight: 700;
   font-size: 0.85rem;
   color: var(--app-accent-color);
}

.note-slide-title {
   color: var(--app-text-color);
   font-size: 0.85rem;
   transition: color 0.2s ease;
}

.note-slide-title:hover {
   color: var(--app-accent-color);
}

.note-excerpt-text {
   font-size: 0.75rem;
   line-height: 1.45;
   color: var(--app-secondary-text-color) !important;
   display: -webkit-box;
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;
   overflow: hidden;
   text-overflow: ellipsis;
   margin-bottom: 0;
}

.btn-action-view {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   color: var(--app-text-color) !important;
   font-size: 0.75rem;
   font-weight: 600;
   padding: 0.25rem 0.65rem;
   border-radius: 0.375rem;
   transition: all 0.2s ease;
}

.btn-action-view:hover {
   background-color: var(--app-accent-color);
   color: var(--app-accent-text-color) !important;
   border-color: var(--app-accent-color);
}

.btn-icon-only {
   width: 24px;
   height: 24px;
   padding: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 4px;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   color: var(--app-secondary-text-color);
   transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-icon-only:hover {
   background-color: var(--app-card-bg);
   color: var(--app-text-color);
}

.dot-indicator {
   width: 6px;
   height: 6px;
   border-radius: 50%;
   background-color: var(--app-border-color);
   cursor: pointer;
   transition: all 0.25s ease;
}

.dot-indicator.active {
   background-color: var(--app-accent-color);
   width: 14px;
   border-radius: 4px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
   transition: all 0.25s ease;
}

.slide-fade-enter-from {
   opacity: 0;
   transform: translateX(10px);
}

.slide-fade-leave-to {
   opacity: 0;
   transform: translateX(-10px);
}

.skeleton-box {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   height: 130px;
   min-height: 130px;
   display: flex;
   flex-direction: column;
   justify-content: center;
}

.skeleton {
   background-color: var(--app-border-color);
   background-image: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
   background-size: 200% 100%;
   animation: shimmer 1.5s infinite;
   border-radius: 4px;
}

body.light-mode .skeleton {
   background-image: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.05), transparent);
}

@keyframes shimmer {
   0% {
      background-position: -200% 0;
   }

   100% {
      background-position: -200% 0;
   }
}
</style>