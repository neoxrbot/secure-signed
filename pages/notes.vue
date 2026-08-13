<template>
   <div class="container px-3 mb-5">
      <div class="notes-page-max-width mx-auto">
         <div class="d-flex align-items-center justify-content-between mb-4">
            <NuxtLink to="/" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
               <i class="bi bi-arrow-left me-1"></i> Home
            </NuxtLink>
            <span class="fs-xs text-muted">Public Articles</span>
         </div>

         <div class="notes-header-card p-4 mb-4 rounded-3 text-center">
            <div class="header-icon-circle mb-2">
               <i class="bi bi-journal-bookmark-fill"></i>
            </div>
            <h3 class="fw-bold text-color mb-1">Articles Library</h3>
            <p class="fs-xs text-muted mb-0">Browse public notes, guides, tutorials & informations</p>
         </div>

         <div class="mb-4">
            <div class="search-box-wrapper">
               <i class="bi bi-search search-icon"></i>
               <input v-model="searchQuery" type="text" class="form-control search-input"
                  placeholder="Search public articles...">
               <button v-if="searchQuery" class="btn-clear-search" @click="searchQuery = ''">
                  <i class="bi bi-x-lg"></i>
               </button>
            </div>
         </div>

         <div v-if="loading" class="d-flex flex-column gap-3">
            <div v-for="i in 5" :key="i" class="public-note-card p-3 rounded-3 skeleton-box">
               <div class="d-flex align-items-center gap-3">
                  <div class="skeleton-thumb"></div>
                  <div class="flex-grow-1">
                     <div class="skeleton-line w-75 mb-2"></div>
                     <div class="skeleton-line w-50"></div>
                  </div>
               </div>
            </div>
         </div>

         <div v-else-if="displayNotes.length" class="d-flex flex-column gap-3">
            <div v-for="n in displayNotes" :key="n.id"
               class="public-note-card p-3 p-md-4 rounded-3 d-flex flex-column gap-2">
               <div class="d-flex align-items-start justify-content-between gap-3">
                  <div class="d-flex align-items-center gap-3 min-w-0 flex-grow-1">
                     <div class="note-thumb-box">
                        <img v-if="n.thumbnail" :src="n.thumbnail" class="note-thumb-img" />
                        <div v-else class="note-thumb-avatar">
                           {{ getFirstLetter(n.title) }}
                        </div>
                     </div>
                     <div class="min-w-0 flex-grow-1">
                        <NuxtLink :to="`/note/${n.id}`" class="note-title text-decoration-none fw-bold d-block"
                           :title="n.title">
                           {{ n.title }}
                        </NuxtLink>
                        <span class="fs-xs text-muted">{{ formatDate(n.created_at) }} &middot; {{ n.reads || 0 }}
                           reads</span>
                     </div>
                  </div>
               </div>

               <p v-if="n.content" class="fs-xs text-muted mb-1 note-excerpt">{{ noteExcerpt(n.content) }}...</p>

               <div v-if="getTagsList(n.tags).length" class="d-flex gap-2 flex-wrap mt-1">
                  <NuxtLink v-for="tag in getTagsList(n.tags)" :key="tag" :to="`/tag/${tag}`"
                     class="tag-badge text-decoration-none">
                     #{{ tag }}
                  </NuxtLink>
               </div>
            </div>
         </div>

         <div v-else class="empty-state p-5 text-center rounded-3">
            <i class="bi bi-journal-x fs-2 text-muted mb-2"></i>
            <h6 class="fw-bold text-color mb-1">No Articles Found</h6>
            <p class="fs-xs text-muted mb-0">{{ searchQuery ? 'No articles match your search term.' : 'There are no public articles published yet.' }}</p>
         </div>

         <div v-if="totalPages > 1 && !searchQuery"
            class="d-flex align-items-center justify-content-between border-top pt-4 mt-4">
            <button class="btn btn-sm btn-outline-secondary px-3" :disabled="page <= 1 || loading"
               @click="goToPage(page - 1)">
               <i class="bi bi-arrow-left me-1"></i> Prev
            </button>
            <span class="fs-xs text-muted fw-bold">PAGE {{ page }} / {{ totalPages }}</span>
            <button class="btn btn-sm btn-outline-secondary px-3" :disabled="page >= totalPages || loading"
               @click="goToPage(page + 1)">
               Next <i class="bi bi-arrow-right ms-1"></i>
            </button>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp, useHead } from '#app'

useHead({ title: 'Articles Library' })

const { $api } = useNuxtApp()

const notes = ref([])
const page = ref(1)
const perPage = ref(10)
const totalNotes = ref(0)
const totalPages = ref(1)
const loading = ref(true)
const searchQuery = ref('')

const displayNotes = computed(() => {
   let list = (notes.value || []).slice()
   if (!searchQuery.value.trim()) return list
   const q = searchQuery.value.toLowerCase()
   return list.filter(n => (n.title || '').toLowerCase().includes(q))
})

const getFirstLetter = (title = '') => {
   const t = title.trim()
   return t ? t.charAt(0).toUpperCase() : 'N'
}

const getTagsList = (tags) => {
   if (Array.isArray(tags)) return tags
   if (typeof tags === 'string') return tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
   return []
}

const noteExcerpt = (content = '') => {
   if (!content) return ''
   return content.replace(/[#*_`>\-!\[\]()]/g, '').slice(0, 120)
}

const formatDate = (v) => {
   if (!v) return '-'
   let val = typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : v
   if (typeof val === 'number' && val < 1e11) val = val * 1000
   const d = new Date(val)
   if (isNaN(d.getTime())) return '-'
   return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const fetchPublicNotes = async () => {
   loading.value = true
   try {
      const res = await $api(`/api/notes?public=true&page=${page.value}&per_page=${perPage.value}`)
      notes.value = res.data || []
      totalNotes.value = res.meta?.total || notes.value.length
      totalPages.value = res.meta?.total_pages || Math.max(Math.ceil(totalNotes.value / perPage.value), 1)
   } catch {
      notes.value = []
   } finally {
      loading.value = false
   }
}

const goToPage = async (target) => {
   if (target < 1 || target > totalPages.value) return
   page.value = target
   await fetchPublicNotes()
   if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(fetchPublicNotes)
</script>

<style scoped>
.fs-xs {
   font-size: 0.75rem;
}

.notes-page-max-width {
   max-width: 780px;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.border-top {
   border-color: var(--app-border-color) !important;
}

.notes-header-card,
.public-note-card,
.empty-state {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
}

.header-icon-circle {
   width: 44px;
   height: 44px;
   margin: 0 auto;
   border-radius: 50%;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.15rem;
   color: var(--app-accent-color);
}

.search-box-wrapper {
   position: relative;
   display: flex;
   align-items: center;
}

.search-icon {
   position: absolute;
   left: 0.85rem;
   font-size: 0.85rem;
   color: var(--app-secondary-text-color);
   pointer-events: none;
}

.search-input {
   background-color: var(--app-card-bg) !important;
   border-color: var(--app-border-color) !important;
   color: var(--app-text-color) !important;
   padding: 0.55rem 2.4rem !important;
   font-size: 0.825rem;
   border-radius: 0.5rem;
}

.btn-clear-search {
   position: absolute;
   right: 0.75rem;
   border: none;
   background: transparent;
   color: var(--app-secondary-text-color);
   font-size: 0.85rem;
   padding: 0;
   display: flex;
   align-items: center;
}

.public-note-card {
   transition: transform 0.2s ease;
}

.public-note-card:hover {
   transform: translateX(3px);
   border-color: var(--app-border-color);
}

.note-thumb-box {
   width: 42px;
   height: 42px;
   border-radius: 0.375rem;
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
   font-size: 0.95rem;
   color: var(--app-accent-color);
}

.note-title {
   font-size: 1.05rem;
   line-height: 1.35;
   color: var(--app-text-color);
}

.note-title:hover {
   color: var(--app-accent-color);
}

.note-excerpt {
   line-height: 1.5;
}

.tag-badge {
   font-size: 0.7rem;
   padding: 0.2rem 0.5rem;
   border-radius: 0.25rem;
   background-color: var(--app-bg);
   color: var(--app-secondary-text-color);
   border: 1px solid var(--app-border-color);
   transition: color 0.2s ease;
}

.tag-badge:hover {
   color: var(--app-accent-color);
   border-color: var(--app-border-color);
}

.skeleton-box {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
}

.skeleton-thumb {
   width: 42px;
   height: 42px;
   border-radius: 0.375rem;
   background: var(--app-border-color);
}

.skeleton-line {
   height: 14px;
   border-radius: 4px;
   background: linear-gradient(90deg, var(--app-bg) 25%, var(--app-border-color) 50%, var(--app-bg) 75%);
   background-size: 200% 100%;
   animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
   0% {
      background-position: 200% 0;
   }

   100% {
      background-position: -200% 0;
   }
}
</style>