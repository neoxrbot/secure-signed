<template>
   <div class="notes-studio-card d-flex flex-column h-100">
      <div class="p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
         <div class="d-flex align-items-center gap-2">
            <div class="header-icon-box">
               <i class="bi bi-journal-bookmark-fill"></i>
            </div>
            <div>
               <h6 class="header-title mb-0">Notes Library</h6>
               <span class="header-subtitle">{{ totalNotes }} article(s) recorded</span>
            </div>
         </div>
         <div class="d-flex align-items-center gap-2">
            <select :value="perPage" class="form-select form-select-sm per-page-select"
               @change="emit('per-page-change', Number($event.target.value))">
               <option :value="5">5 / page</option>
               <option :value="10">10 / page</option>
               <option :value="20">20 / page</option>
            </select>
            <button class="btn btn-sm btn-outline-secondary btn-icon-only" @click="emit('refresh')" :disabled="loading"
               title="Refresh notes">
               <i class="bi bi-arrow-repeat" :class="{ 'spin': loading }"></i>
            </button>
         </div>
      </div>

      <div class="px-3 py-2 border-bottom">
         <div class="search-box-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input v-model="searchQuery" type="text" class="form-control search-input"
               placeholder="Search note title...">
            <button v-if="searchQuery" class="btn-clear-search" @click="searchQuery = ''"><i
                  class="bi bi-x-lg"></i></button>
         </div>
      </div>

      <div class="p-3 flex-grow-1 overflow-hidden">
         <div class="notes-list-wrapper d-flex flex-column gap-2">
            <template v-if="loading">
               <div v-for="i in Math.min(perPage, 5)" :key="`skeleton-${i}`" class="note-card-row">
                  <div class="d-flex align-items-center justify-content-between gap-2 min-w-0">
                     <div class="skeleton-title" :style="{ width: `${45 + (i * 13) % 35}%` }"></div>
                     <div class="d-flex align-items-center gap-1 flex-shrink-0">
                        <div class="skeleton-btn"></div>
                        <div class="skeleton-btn"></div>
                     </div>
                  </div>
                  <div class="note-item-divider my-2"></div>
                  <div class="d-flex align-items-center justify-content-between gap-2">
                     <div class="d-flex align-items-center gap-2">
                        <div class="skeleton-badge"></div>
                        <div class="skeleton-meta" style="width: 50px;"></div>
                     </div>
                     <div class="skeleton-meta" style="width: 70px;"></div>
                  </div>
               </div>
            </template>

            <template v-else>
               <div v-for="note in displayNotes" :key="note.id" class="note-card-row"
                  :class="{ 'is-editing': activeEditId === note.id }">
                  <div class="d-flex align-items-center justify-content-between gap-2 min-w-0 mb-2">
                     <div class="d-flex align-items-center gap-2 min-w-0">
                        <div class="list-thumb-box">
                           <img v-if="note.thumbnail" :src="note.thumbnail" class="list-thumb-img" />
                           <div v-else class="list-thumb-avatar">
                              {{ getFirstLetter(note.title) }}
                           </div>
                        </div>
                        <NuxtLink :to="`/note/${note.id}`"
                           class="note-row-title text-truncate fw-semibold text-decoration-none" :title="note.title">
                           {{ note.title }}
                        </NuxtLink>
                     </div>

                     <div class="action-buttons-group d-flex align-items-center gap-1 flex-shrink-0">
                        <button class="btn-action-pill edit-btn" title="Edit note" @click="emit('edit', note)">
                           <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn-action-pill delete-btn" title="Delete note" @click="emit('delete', note.id)">
                           <i class="bi bi-trash3-fill"></i>
                        </button>
                     </div>
                  </div>

                  <div v-if="note.tags && note.tags.length" class="d-flex gap-1 flex-wrap mb-2">
                     <NuxtLink v-for="tag in getTagsList(note.tags)" :key="tag" :to="`/tag/${tag}`"
                        class="tag-badge text-decoration-none">
                        #{{ tag }}
                     </NuxtLink>
                  </div>

                  <div class="note-item-divider my-2"></div>

                  <div class="d-flex align-items-center justify-content-between gap-2 fs-xs text-muted flex-wrap">
                     <div class="d-flex align-items-center gap-2">
                        <span v-if="note.is_private" class="pill-badge private">
                           <i class="bi bi-lock-fill"></i> Private
                        </span>
                        <span v-else class="pill-badge public">
                           <i class="bi bi-globe"></i> Public
                        </span>
                        <span><i class="bi bi-eye me-1 opacity-75"></i>{{ note.reads || 0 }} reads</span>
                     </div>
                     <span><i class="bi bi-calendar3 me-1 opacity-75"></i>{{ formatDate(note.created_at) }}</span>
                  </div>
               </div>

               <div v-if="!displayNotes.length" class="empty-state-box p-4 text-center">
                  <div class="empty-icon-circle mb-2">
                     <i class="bi bi-journal-x"></i>
                  </div>
                  <h6 class="fs-sm fw-bold text-color mb-1">No notes found</h6>
                  <p class="fs-xs text-muted mb-0">{{ searchQuery ? 'No notes match your search term.' : 'Start creating
                     your first article on the left editor.' }}</p>
               </div>
            </template>
         </div>
      </div>

      <div class="p-3 border-top d-flex align-items-center justify-content-between">
         <button class="btn btn-sm btn-outline-secondary btn-pagination" :disabled="page <= 1 || loading"
            @click="emit('page-change', page - 1)">
            <i class="bi bi-arrow-left me-1"></i> Prev
         </button>
         <div class="pagination-info fs-xs text-muted fw-bold">
            PAGE {{ page }} <span class="fw-normal">/</span> {{ totalPages }}
         </div>
         <button class="btn btn-sm btn-outline-secondary btn-pagination" :disabled="page >= totalPages || loading"
            @click="emit('page-change', page + 1)">
            Next <i class="bi bi-arrow-right ms-1"></i>
         </button>
      </div>
   </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
   notes: { type: Array, default: () => [] },
   page: { type: Number, default: 1 },
   perPage: { type: Number, default: 5 },
   totalNotes: { type: Number, default: 0 },
   loading: { type: Boolean, default: false },
   activeEditId: { type: String, default: '' }
})

const emit = defineEmits(['edit', 'delete', 'page-change', 'per-page-change', 'refresh'])

const searchQuery = ref('')

const totalPages = computed(() => Math.max(Math.ceil((props.totalNotes || 0) / (props.perPage || 5)), 1))

const displayNotes = computed(() => {
   let list = (props.notes || []).slice()
   list.sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0))
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

const formatDate = (v) => {
   if (!v) return '-'
   let val = typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : v
   if (typeof val === 'number' && val < 1e11) {
      val = val * 1000
   }
   const d = new Date(val)
   if (isNaN(d.getTime())) return '-'
   return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.fs-xs {
   font-size: 0.725rem;
}

.fs-sm {
   font-size: 0.825rem;
}

.min-w-0 {
   min-width: 0;
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

.border-bottom,
.border-top {
   border-color: var(--app-border-color) !important;
}

.notes-studio-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.625rem;
   overflow: hidden;
}

.header-icon-box {
   width: 32px;
   height: 32px;
   border-radius: 0.375rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
   font-size: 0.9rem;
}

.header-title {
   font-weight: 700;
   color: var(--app-text-color);
   font-size: 0.9rem;
}

.header-subtitle {
   font-size: 0.675rem;
   color: var(--app-secondary-text-color) !important;
}

.per-page-select {
   width: auto;
   background-color: var(--app-bg) !important;
   color: var(--app-text-color) !important;
   border-color: var(--app-border-color) !important;
   font-size: 0.75rem;
   padding: 0.2rem 1.5rem 0.2rem 0.5rem;
}

.btn-icon-only {
   width: 28px;
   height: 28px;
   padding: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 0.375rem;
}

.search-box-wrapper {
   position: relative;
   display: flex;
   align-items: center;
}

.search-icon {
   position: absolute;
   left: 0.75rem;
   font-size: 0.8rem;
   color: var(--app-secondary-text-color);
   pointer-events: none;
}

.search-input {
   background-color: var(--app-bg) !important;
   border-color: var(--app-border-color) !important;
   color: var(--app-text-color) !important;
   padding: 0.5rem 2.2rem !important;
   font-size: 0.775rem;
   border-radius: 0.375rem;
}

.btn-clear-search {
   position: absolute;
   right: 0.65rem;
   border: none;
   background: transparent;
   color: var(--app-secondary-text-color);
   font-size: 0.8rem;
   padding: 0;
   display: flex;
   align-items: center;
}

.notes-list-wrapper {
   max-height: none;
   overflow: visible;
}

.note-card-row {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.5rem;
   padding: 0.75rem 0.85rem;
   transition: transform 0.2s ease;
}

.note-card-row:hover {
   transform: translateX(2px);
}

.note-card-row.is-editing {
   background-color: var(--app-card-bg);
}

.list-thumb-box {
   width: 28px;
   height: 28px;
   border-radius: 0.25rem;
   overflow: hidden;
   border: 1px solid var(--app-border-color);
   background-color: var(--app-card-bg);
   flex-shrink: 0;
}

.list-thumb-img {
   width: 100%;
   height: 100%;
   object-fit: cover;
}

.list-thumb-avatar {
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-weight: 700;
   font-size: 0.75rem;
   color: var(--app-accent-color);
}

.tag-badge {
   font-size: 0.65rem;
   padding: 0.1rem 0.35rem;
   border-radius: 0.2rem;
   background-color: var(--app-card-bg);
   color: var(--app-secondary-text-color);
   border: 1px solid var(--app-border-color);
}

.tag-badge:hover {
   color: var(--app-accent-color);
   border-color: var(--app-border-color);
}

.note-item-divider {
   height: 1px;
   background-color: var(--app-border-color);
   width: 100%;
}

.pill-badge {
   display: inline-flex;
   align-items: center;
   gap: 0.25rem;
   font-size: 0.625rem;
   font-weight: 600;
   padding: 0.15rem 0.4rem;
   border-radius: 0.25rem;
   flex-shrink: 0;
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

.note-row-title {
   color: var(--app-text-color);
   font-size: 0.85rem;
   line-height: 1.3;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
   max-width: 100%;
}

.note-row-title:hover {
   color: var(--app-accent-color);
}

.btn-action-pill {
   border: 1px solid var(--app-border-color);
   background-color: var(--app-card-bg);
   color: var(--app-secondary-text-color);
   width: 28px;
   height: 28px;
   border-radius: 0.375rem;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 0.75rem;
   transition: all 0.15s ease;
}

.btn-action-pill.edit-btn:hover {
   color: var(--app-accent-color);
   border-color: var(--app-accent-color);
}

.btn-action-pill.delete-btn:hover {
   color: #dc3545;
   border-color: rgba(220, 53, 69, 0.5);
   background-color: rgba(220, 53, 69, 0.1);
}

.empty-state-box {
   background-color: var(--app-bg);
   border: 1px dashed var(--app-border-color);
   border-radius: 0.5rem;
}

.empty-icon-circle {
   width: 40px;
   height: 40px;
   margin: 0 auto;
   border-radius: 50%;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.2rem;
   color: var(--app-secondary-text-color);
}

.btn-pagination {
   font-size: 0.75rem;
   padding: 0.25rem 0.6rem;
}

.pagination-info {
   letter-spacing: 0.05em;
}

.spin {
   animation: spin 1s linear infinite;
}

.skeleton-title,
.skeleton-badge,
.skeleton-meta,
.skeleton-btn {
   background: linear-gradient(90deg,
         var(--app-bg) 25%,
         var(--app-border-color) 50%,
         var(--app-bg) 75%);
   background-size: 200% 100%;
   animation: shimmer 1.5s infinite linear;
   border-radius: 0.25rem;
}

.skeleton-title {
   height: 16px;
}

.skeleton-badge {
   width: 48px;
   height: 18px;
}

.skeleton-meta {
   height: 12px;
}

.skeleton-btn {
   width: 28px;
   height: 28px;
   border-radius: 0.375rem;
}

@keyframes shimmer {
   0% {
      background-position: 200% 0;
   }

   100% {
      background-position: -200% 0;
   }
}

@keyframes spin {
   from {
      transform: rotate(0deg);
   }

   to {
      transform: rotate(360deg);
   }
}
</style>