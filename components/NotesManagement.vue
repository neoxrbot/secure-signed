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
               @change="emit('per-page-change', Number(($event.target as HTMLSelectElement).value))">
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

      <div class="px-3 pt-3 pb-1">
         <div class="search-box-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input v-model="searchQuery" type="text" class="form-control form-control-sm search-input"
               placeholder="Search note title...">
            <button v-if="searchQuery" class="btn-clear-search" @click="searchQuery = ''"><i
                  class="bi bi-x-lg"></i></button>
         </div>
      </div>

      <div class="p-3 flex-grow-1 overflow-hidden">
         <div class="notes-list-wrapper custom-scroll d-flex flex-column gap-2">
            <div v-for="note in displayNotes" :key="note.id" class="note-card-row p-2.5"
               :class="{ 'is-editing': activeEditId === note.id }">
               <div class="d-flex align-items-start justify-content-between gap-2 min-w-0">
                  <div class="min-w-0 flex-grow-1">
                     <div class="d-flex align-items-center gap-2 mb-1 min-w-0">
                        <span v-if="note.is_private" class="pill-badge private">
                           <i class="bi bi-lock-fill"></i> Private
                        </span>
                        <span v-else class="pill-badge public">
                           <i class="bi bi-globe"></i> Public
                        </span>
                        <NuxtLink :to="`/note/${note.id}`"
                           class="note-row-title text-truncate fw-semibold text-decoration-none" :title="note.title">
                           {{ note.title }}
                        </NuxtLink>
                     </div>
                     <div class="d-flex align-items-center gap-2 fs-xs text-muted">
                        <span><i class="bi bi-eye me-1 opacity-75"></i>{{ note.reads || 0 }} reads</span>
                        <span>•</span>
                        <span><i class="bi bi-calendar3 me-1 opacity-75"></i>{{ formatDate(note.created_at) }}</span>
                     </div>
                  </div>

                  <div class="action-buttons-group d-flex align-items-center gap-1 flex-shrink-0">
                     <button class="btn-action-pill edit-btn" title="Edit note" @click="emit('edit', note)">
                        <i class="bi bi-pencil-square"></i>
                     </button>
                     <button class="btn-action-pill delete-btn" title="Delete note" @click="emit('delete', note.id)">
                        <i class="bi bi-trash3-fill"></i>
                     </button>
                  </div>
               </div>
            </div>

            <div v-if="!displayNotes.length && !loading" class="empty-state-box p-4 text-center">
               <div class="empty-icon-circle mb-2">
                  <i class="bi bi-journal-x"></i>
               </div>
               <h6 class="fs-sm fw-bold text-color mb-1">No notes found</h6>
               <p class="fs-xs text-muted mb-0">{{ searchQuery ? 'No notes match your search term.' : 'Start creating your first article on the left editor.' }}</p>
            </div>
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

<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = defineProps<{
   notes: any[]
   page: number
   perPage: number
   totalNotes: number
   loading?: boolean
   activeEditId?: string
}>()

const emit = defineEmits(['edit', 'delete', 'page-change', 'per-page-change', 'refresh'])

const searchQuery = ref('')

const totalPages = computed(() => Math.max(Math.ceil(props.totalNotes / props.perPage), 1))

const displayNotes = computed(() => {
   if (!searchQuery.value.trim()) return props.notes
   const q = searchQuery.value.toLowerCase()
   return props.notes.filter(n => (n.title || '').toLowerCase().includes(q))
})

const formatDate = (v: number | string) => {
   if (!v) return '-'
   return new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
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
   left: 0.65rem;
   font-size: 0.75rem;
   color: var(--app-secondary-text-color);
   pointer-events: none;
}

.search-input {
   background-color: var(--app-bg) !important;
   border-color: var(--app-border-color) !important;
   color: var(--app-text-color) !important;
   padding-left: 2rem !important;
   padding-right: 2rem !important;
   font-size: 0.75rem;
   border-radius: 0.375rem;
}

.btn-clear-search {
   position: absolute;
   right: 0.5rem;
   border: none;
   background: transparent;
   color: var(--app-secondary-text-color);
   font-size: 0.75rem;
   padding: 0;
   display: flex;
   align-items: center;
}

.notes-list-wrapper {
   max-height: 480px;
   overflow-y: auto;
}

.note-card-row {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.5rem;
   transition: all 0.2s ease;
}

.note-card-row:hover {
   transform: translateX(2px);
   border-color: var(--app-secondary-text-color);
}

.note-card-row.is-editing {
   border-color: var(--app-accent-color);
   background-color: var(--app-card-bg);
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
   font-size: 0.825rem;
   line-height: 1.25;
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

@keyframes spin {
   from {
      transform: rotate(0deg);
   }

   to {
      transform: rotate(360deg);
   }
}
</style>