<template>
   <div class="notes-management-card d-flex flex-column h-100">
      <div class="p-2 px-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
         <div class="d-flex align-items-center gap-2">
            <div class="notes-badge"><i class="bi bi-journal-text"></i></div>
            <div>
               <h6 class="notes-title mb-0">Library</h6>
               <span class="notes-subtitle">{{ totalNotes }} note(s) total</span>
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
               title="Refresh list">
               <i class="bi bi-arrow-repeat" :class="{ 'spin': loading }"></i>
            </button>
         </div>
      </div>

      <div class="p-2 flex-grow-1 overflow-hidden">
         <div class="notes-list d-flex flex-column gap-1">
            <div v-for="note in notes" :key="note.id" class="note-compact-item p-2"
               :class="{ 'editing': activeEditId === note.id }">
               <div class="d-flex align-items-center justify-content-between gap-2 min-w-0">
                  <div class="min-w-0 flex-grow-1">
                     <div class="d-flex align-items-center gap-1 min-w-0">
                        <i v-if="note.is_private" class="bi bi-lock-fill text-danger fs-xs flex-shrink-0"
                           title="Private"></i>
                        <NuxtLink :to="`/note/${note.id}`"
                           class="note-title text-truncate d-block fw-semibold text-decoration-none"
                           :title="note.title">
                           {{ note.title }}
                        </NuxtLink>
                     </div>
                     <div class="fs-xs text-muted d-flex align-items-center gap-2 mt-0.5">
                        <span><i class="bi bi-eye me-1"></i>{{ note.reads || 0 }}</span>
                        <span>•</span>
                        <span>{{ formatDate(note.created_at) }}</span>
                     </div>
                  </div>

                  <div class="d-flex align-items-center gap-1 flex-shrink-0">
                     <button class="btn-action-icon" title="Edit" @click="emit('edit', note)">
                        <i class="bi bi-pencil"></i>
                     </button>
                     <button class="btn-action-icon text-danger-hover" title="Delete" @click="emit('delete', note.id)">
                        <i class="bi bi-trash"></i>
                     </button>
                  </div>
               </div>
            </div>

            <div v-if="!notes.length && !loading" class="empty-notes p-3 text-center text-muted fs-xs">
               <i class="bi bi-journal-x fs-5 d-block mb-1"></i>
               No notes found.
            </div>
         </div>
      </div>

      <div class="p-2 px-3 border-top d-flex align-items-center justify-content-between">
         <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            :disabled="page <= 1 || loading" @click="emit('page-change', page - 1)">
            <i class="bi bi-chevron-left"></i> Prev
         </button>
         <span class="fs-xs text-muted fw-semibold">Page {{ page }} / {{ totalPages }}</span>
         <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            :disabled="page >= totalPages || loading" @click="emit('page-change', page + 1)">
            Next <i class="bi bi-chevron-right"></i>
         </button>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
   notes: any[]
   page: number
   perPage: number
   totalNotes: number
   loading?: boolean
   activeEditId?: string
}>()

const emit = defineEmits(['edit', 'delete', 'page-change', 'per-page-change', 'refresh'])

const totalPages = computed(() => Math.max(Math.ceil(props.totalNotes / props.perPage), 1))

const formatDate = (v: number | string) => {
   if (!v) return '-'
   return new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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

.notes-management-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.625rem;
   overflow: hidden;
}

.notes-badge {
   width: 28px;
   height: 28px;
   border-radius: 0.375rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
   font-size: 0.85rem;
}

.notes-title {
   font-weight: 700;
   color: var(--app-text-color);
   font-size: 0.875rem;
}

.notes-subtitle {
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

.note-compact-item {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.375rem;
   transition: all 0.15s ease;
}

.note-compact-item.editing {
   border-color: var(--app-accent-color);
}

.note-title {
   color: var(--app-text-color);
   font-size: 0.825rem;
   line-height: 1.2;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
   max-width: 100%;
}

.note-title:hover {
   color: var(--app-accent-color);
}

.btn-action-icon {
   border: none;
   background: transparent;
   color: var(--app-secondary-text-color);
   width: 26px;
   height: 26px;
   border-radius: 0.25rem;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 0.8rem;
   transition: all 0.15s ease;
}

.btn-action-icon:hover {
   background-color: var(--app-card-bg);
   color: var(--app-text-color);
}

.btn-action-icon.text-danger-hover:hover {
   background-color: rgba(220, 53, 69, 0.15);
   color: #dc3545 !important;
}

.empty-notes {
   background-color: var(--app-bg);
   border: 1px dashed var(--app-border-color);
   border-radius: 0.375rem;
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