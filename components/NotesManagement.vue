<template>
   <div class="notes-management-card d-flex flex-column h-100">
      <div class="p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
         <div class="d-flex align-items-center gap-2">
            <div class="notes-badge"><i class="bi bi-journal-text"></i></div>
            <div>
               <h6 class="notes-title mb-0">Notes Library</h6>
               <span class="notes-subtitle">{{ totalNotes }} note(s) total</span>
            </div>
         </div>
         <select :value="perPage" class="form-select form-select-sm per-page-select"
            @change="emit('per-page-change', Number(($event.target as HTMLSelectElement).value))">
            <option :value="5">5 / page</option>
            <option :value="10">10 / page</option>
            <option :value="20">20 / page</option>
         </select>
      </div>

      <div class="p-3 flex-grow-1">
         <div class="notes-list d-flex flex-column gap-2">
            <div v-for="note in notes" :key="note.id" class="note-item-card p-3"
               :class="{ 'editing': activeEditId === note.id }">
               <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div class="min-w-0 flex-grow-1">
                     <NuxtLink :to="`/note/${note.id}`"
                        class="note-item-title fw-bold text-decoration-none text-truncate d-block">
                        {{ note.title }}
                     </NuxtLink>
                     <div class="d-flex align-items-center gap-2 fs-xs text-muted mt-1">
                        <span><i class="bi bi-eye me-1"></i>{{ note.reads || 0 }}</span>
                        <span>•</span>
                        <span>{{ formatDate(note.created_at) }}</span>
                        <span v-if="note.is_private" class="badge badge-private">Private</span>
                     </div>
                  </div>
               </div>
               <div class="d-flex align-items-center justify-content-end gap-2 pt-2 border-top-subtle">
                  <button class="btn btn-xs btn-outline-secondary d-flex align-items-center gap-1"
                     @click="emit('edit', note)">
                     <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-xs btn-outline-danger d-flex align-items-center gap-1"
                     @click="emit('delete', note.id)">
                     <i class="bi bi-trash"></i> Delete
                  </button>
               </div>
            </div>

            <div v-if="!notes.length" class="empty-notes p-4 text-center text-muted fs-sm">
               <i class="bi bi-journal-x fs-3 d-block mb-1"></i>
               No notes found. Create your first note!
            </div>
         </div>
      </div>

      <div class="p-3 border-top d-flex align-items-center justify-content-between">
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

const emit = defineEmits(['edit', 'delete', 'page-change', 'per-page-change'])

const totalPages = computed(() => Math.max(Math.ceil(props.totalNotes / props.perPage), 1))

const formatDate = (v: number | string) => {
   if (!v) return '-'
   return new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.fs-xs {
   font-size: 0.75rem;
}

.fs-sm {
   font-size: 0.875rem;
}

.btn-xs {
   font-size: 0.75rem;
   padding: 0.2rem 0.5rem;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.border-bottom,
.border-top {
   border-color: var(--app-border-color) !important;
}

.border-top-subtle {
   border-top: 1px solid var(--app-border-color);
}

.notes-management-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.625rem;
   overflow: hidden;
}

.notes-badge {
   width: 32px;
   height: 32px;
   border-radius: 0.375rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
}

.notes-title {
   font-weight: 700;
   color: var(--app-text-color);
   font-size: 0.95rem;
}

.notes-subtitle {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color) !important;
}

.per-page-select {
   width: auto;
   background-color: var(--app-bg) !important;
   color: var(--app-text-color) !important;
   border-color: var(--app-border-color) !important;
}

.note-item-card {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.5rem;
   transition: all 0.2s ease;
}

.note-item-card.editing {
   border-color: var(--app-accent-color);
}

.note-item-title {
   color: var(--app-text-color);
   font-size: 0.9rem;
}

.note-item-title:hover {
   color: var(--app-accent-color);
}

.badge-private {
   background-color: rgba(220, 53, 69, 0.15);
   color: #dc3545;
   border: 1px solid rgba(220, 53, 69, 0.3);
   font-size: 0.65rem;
}

.empty-notes {
   background-color: var(--app-bg);
   border: 1px dashed var(--app-border-color);
   border-radius: 0.5rem;
}
</style>