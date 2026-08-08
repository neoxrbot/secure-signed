<template>
   <div class="container px-3 mb-5">
      <div class="reader-max-width mx-auto">
         <div class="d-flex align-items-center justify-content-between mb-4">
            <NuxtLink to="/" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
               <i class="bi bi-arrow-left me-1"></i> Home
            </NuxtLink>
            <span class="fs-xs text-muted">Tag Filtering</span>
         </div>

         <div class="tag-header-card p-4 mb-4 rounded-3 text-center">
            <span class="fs-xs text-uppercase fw-bold text-muted tracking-wider d-block mb-1">Articles Tagged
               With</span>
            <h3 class="fw-bold text-color mb-0">#{{ tagName }}</h3>
            <span class="fs-xs text-muted mt-2 d-block">{{ totalNotes }} article(s) found</span>
         </div>

         <div v-if="loading" class="d-flex flex-column gap-3">
            <div v-for="i in 3" :key="i" class="tag-note-card p-3 rounded-3 skeleton">
               <div class="skeleton-line w-50 mb-2"></div>
               <div class="skeleton-line w-25"></div>
            </div>
         </div>

         <div v-else-if="notes.length" class="d-flex flex-column gap-3">
            <NuxtLink v-for="n in notes" :key="n.id" :to="`/note/${n.id}`"
               class="tag-note-card p-3 rounded-3 text-decoration-none d-flex align-items-center justify-content-between gap-3">
               <div class="d-flex align-items-center gap-3 min-w-0">
                  <div class="tag-thumb-box">
                     <img v-if="n.thumbnail" :src="n.thumbnail" class="tag-thumb-img" />
                     <div v-else class="tag-thumb-avatar">
                        {{ getFirstLetter(n.title) }}
                     </div>
                  </div>
                  <div class="min-w-0">
                     <h6 class="fw-bold text-color mb-1 text-truncate">{{ n.title }}</h6>
                     <span class="fs-xs text-muted">{{ formatDate(n.created_at) }} &middot; {{ n.reads || 0 }}
                        reads</span>
                  </div>
               </div>
               <i class="bi bi-chevron-right text-muted flex-shrink-0"></i>
            </NuxtLink>
         </div>

         <div v-else class="empty-state p-5 text-center rounded-3">
            <i class="bi bi-journal-x fs-2 text-muted mb-2"></i>
            <h6 class="fw-bold text-color mb-1">No Notes Found</h6>
            <p class="fs-xs text-muted mb-0">There are no public articles tagged with #{{ tagName }}.</p>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useNuxtApp, useHead } from '#app'

const route = useRoute()
const { $api } = useNuxtApp()
const tagName = computed(() => String(route.params.tag || ''))

useHead({ title: `#${tagName.value} - Tagged Notes` })

const notes = ref([])
const totalNotes = ref(0)
const loading = ref(true)

const getFirstLetter = (title = '') => {
   const t = title.trim()
   return t ? t.charAt(0).toUpperCase() : 'N'
}

const formatDate = (v) => {
   if (!v) return '-'
   let val = typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : v
   if (typeof val === 'number' && val < 1e11) val = val * 1000
   const d = new Date(val)
   if (isNaN(d.getTime())) return '-'
   return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const fetchTaggedNotes = async () => {
   loading.value = true
   try {
      const res = await $api(`/api/notes?public=true&limit=50`)
      const allNotes = res.data || []
      notes.value = allNotes.filter(n => {
         if (!n.tags) return false
         const tagArray = Array.isArray(n.tags) ? n.tags : n.tags.split(',').map(t => t.trim().replace(/^#/, ''))
         return tagArray.some(t => t.toLowerCase() === tagName.value.toLowerCase())
      })
      totalNotes.value = notes.value.length
   } catch {
      notes.value = []
   } finally {
      loading.value = false
   }
}

onMounted(fetchTaggedNotes)
</script>

<style scoped>
.fs-xs {
   font-size: 0.75rem;
}

.tracking-wider {
   letter-spacing: 0.05em;
}

.reader-max-width {
   max-width: 720px;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.tag-header-card,
.tag-note-card,
.empty-state {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
}

.tag-note-card {
   transition: transform 0.2s ease, border-color 0.2s ease;
}

.tag-note-card:hover {
   transform: translateX(3px);
   border-color: var(--app-accent-color);
}

.tag-thumb-box {
   width: 38px;
   height: 38px;
   border-radius: 0.375rem;
   overflow: hidden;
   border: 1px solid var(--app-border-color);
   background-color: var(--app-bg);
   flex-shrink: 0;
}

.tag-thumb-img {
   width: 100%;
   height: 100%;
   object-fit: cover;
}

.tag-thumb-avatar {
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-weight: 700;
   font-size: 0.9rem;
   color: var(--app-accent-color);
}

.skeleton {
   background: linear-gradient(90deg, var(--app-bg) 25%, var(--app-border-color) 50%, var(--app-bg) 75%);
   background-size: 200% 100%;
   animation: shimmer 1.5s infinite linear;
}

.skeleton-line {
   height: 14px;
   border-radius: 4px;
   background: var(--app-border-color);
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