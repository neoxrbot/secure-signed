<template>
   <div class="content-card">
      <div class="card-header d-flex justify-content-between align-items-center">
         <h5 class="main-title mb-0 fs-6">
            <i class="bi bi-bar-chart-line me-2"></i>API Overview
         </h5>
         <button @click="$emit('refresh')" class="btn btn-sm btn-refresh" title="Refresh stats">
            <i class="bi bi-arrow-clockwise"></i>
         </button>
      </div>

      <div class="card-body p-0 scrollable-list">
         <div v-if="isLoading" class="text-center text-secondary py-4">
            <div class="spinner-border spinner-border-sm" role="status"></div>
         </div>
         <div v-else class="list-group list-group-flush">
            <div v-for="item in overviewItems" :key="item.label" class="list-group-item">
               <div class="d-flex w-100 justify-content-between align-items-center">
                  <div class="d-flex align-items-center text-truncate">
                     <i :class="`${item.icon} me-2 fs-5`"></i>
                     <span class="file-name text-truncate">{{ item.label }}</span>
                  </div>
                  <small class="file-size text-secondary ms-2 flex-shrink-0">{{ item.value }}</small>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
   stats: {
      totalFiles: number;
      totalSize: number;
      totalDownloads: number;
      apiHits: number;
      totalShorts: number;
      totalViews: number;
      totalProxied: number;
      hitsToday: number;
   };
   isLoading: boolean;
}>()

defineEmits(['refresh'])

const formatBytes = (bytes: number, decimals = 2) => {
   if (!bytes || bytes === 0) return '0 Bytes'
   const k = 1024; const dm = decimals < 0 ? 0 : decimals; const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const overviewItems = computed(() => [
   { label: 'Total Files', value: props.stats.totalFiles.toLocaleString(), icon: 'bi bi-files' },
   { label: 'Storage Used', value: formatBytes(props.stats.totalSize), icon: 'bi bi-database' },
   { label: 'Short Links', value: props.stats.totalShorts.toLocaleString(), icon: 'bi bi-link-45deg' },
   { label: 'Views', value: props.stats.totalViews.toLocaleString(), icon: 'bi bi-eye' },
   { label: 'Proxied Requests', value: props.stats.totalProxied.toLocaleString(), icon: 'bi bi-shuffle' },
   { label: 'Downloaded Data', value: formatBytes(props.stats.totalDownloads), icon: 'bi bi-download' },
   { label: 'Total Hits', value: props.stats.apiHits.toLocaleString(), icon: 'bi bi-activity' },
   { label: 'Hits Today', value: props.stats.hitsToday.toLocaleString(), icon: 'bi bi-calendar-day' }
])
</script>

<style scoped>
.content-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: .5rem;
   overflow: hidden;
}

.card-header {
   background-color: var(--app-bg);
   border-bottom: 1px solid var(--app-border-color);
   padding: 0.85rem 1.25rem;
}

.main-title {
   font-size: 0.9rem;
   font-weight: 600;
   color: var(--app-text-color);
}

.btn-refresh {
   background-color: transparent;
   border: 1px solid transparent;
   color: var(--app-secondary-text-color);
   padding: 0.2rem 0.5rem;
   line-height: 1;
   font-size: 0.8rem;
   transition: all 0.2s;
}

.btn-refresh:hover {
   color: var(--app-text-color);
   background-color: var(--app-border-color);
}

.scrollable-list {
   max-height: 350px;
   overflow-y: auto;
}

.scrollable-list::-webkit-scrollbar {
   width: 6px;
}

.scrollable-list::-webkit-scrollbar-track {
   background: transparent;
}

.scrollable-list::-webkit-scrollbar-thumb {
   background-color: var(--app-border-color);
   border-radius: 10px;
}

.scrollable-list::-webkit-scrollbar-thumb:hover {
   background-color: var(--app-secondary-text-color);
}

.list-group-item {
   background-color: transparent;
   color: var(--app-text-color);
   border-bottom: 1px solid var(--app-border-color);
   padding: 0.75rem 1.25rem;
}

.list-group-item:last-child {
   border-bottom: none;
}

.file-name {
   font-size: 0.9rem;
   font-weight: 500;
}

.file-size {
   font-size: 0.8rem;
   font-family: 'Courier New', monospace;
}
</style>
