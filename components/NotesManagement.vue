<template>
   <div class="notes-management-card d-flex flex-column h-100">
      <div class="p-2 px-3 border-bottom d-flex align-items-center justify-content-between">
         <div class="d-flex align-items-center gap-2">
            <div class="notes-badge"><i class="bi bi-journal-text"></i></div>
            <div>
               <h6 class="notes-title mb-0">Library</h6>
               <span class="notes-subtitle">{{ notes.length }} of {{ totalNotes }} note(s)</span>
            </div>
         </div>
         <button class="btn btn-sm btn-outline-secondary btn-icon-only" @click="emit('refresh')" :disabled="loading"
            title="Refresh list">
            <i class="bi bi-arrow-repeat" :class="{ 'spin': loading }"></i>
         </button>
      </div>

      <div class="notes-scroll-area p-2 flex-grow-1 custom-scroll" ref="scrollContainerRef">
         <div class="notes-list d-flex flex-column gap-1">
            <div v-for="note in notes" :key="note.id" class="note-compact-item p-2"
               :class="{ 'editing': activeEditId === note.id }">
               <div class="d-flex align-items-center justify-content-between gap-2">
                  <div class="min-w-0 flex-grow-1">
                     <div class="d-flex align-items-center gap-1">
                        <i v-if="note.is_private" class="bi bi-lock-fill text-danger fs-xs" title="Private"></i>
                        <NuxtLink :to="`/note/${note.id}`"
                           class="note-title text-truncate d-block fw-semibold text-decoration-none">
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

            <div ref="sentinelRef" class="lazy-load-sentinel py-2 text-center">
               <span v-if="loading" class="spinner-border spinner-border-sm text-accent"></span>
               <span v-else-if="hasMore" class="fs-xs text-muted">Scroll to load more</span>
               <span v-else-if="notes.length" class="fs-xs text-muted opacity-50">End of library</span>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
   notes: any[]
   totalNotes: number
   loading?: boolean
   activeEditId?: string
}>()

const emit = defineEmits(['edit', 'delete', 'load-more', 'refresh'])

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const hasMore = computed(() => props.notes.length < props.totalNotes)

const formatDate = (v: number | string) => {
   if (!v) return '-'
   return new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

onMounted(() => {
   observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting && hasMore.value && !props.loading) {
         emit('load-more')
      }
   }, { rootMargin: '60px' })

   if (sentinelRef.value) {
      observer.observe(sentinelRef.value)
   }
})

onBeforeUnmount(() => {
   if (observer) observer.disconnect()
})
</script>

<style scoped>
.fs-xs {
   font-size: 0.725rem;
}

.fs-sm {
   font-size: 0.825rem;
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

.btn-icon-only {
   width: 28px;
   height: 28px;
   padding: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 0.375rem;
}

.notes-scroll-area {
   max-height: 520px;
   overflow-y: auto;
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