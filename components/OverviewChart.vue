<template>
   <div class="overview-card p-3 rounded-3">
      <div class="mb-3">
         <span class="fs-xs text-muted text-uppercase fw-bold">Total Requests (8 Days)</span>
         <h4 class="fw-bold text-color mb-0">{{ totalHits.toLocaleString() }}</h4>
      </div>

      <div class="chart-container d-flex align-items-end justify-content-between gap-2 pt-4 pb-2 px-2">
         <div v-for="(item, idx) in chartData" :key="idx"
            class="bar-col d-flex flex-column align-items-center flex-grow-1">
            <div class="bar-wrapper w-100 d-flex align-items-end justify-content-center">
               <div class="bar-item" :style="{ height: getBarHeight(item.hits) }"
                  :title="`${item.date}: ${item.hits} requests`"></div>
            </div>
            <span class="fs-xs text-muted mt-2">{{ item.day }}</span>
         </div>
      </div>
   </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
   data: { type: Array, default: () => [] }
})

const chartData = computed(() => props.data || [])

const totalHits = computed(() => {
   return chartData.value.reduce((acc, curr) => acc + (curr.hits || 0), 0)
})

const maxHits = computed(() => {
   const max = Math.max(...chartData.value.map(d => d.hits || 0), 1)
   return max
})

const getBarHeight = (hits) => {
   if (!hits) return '4px'
   const pct = Math.round((hits / maxHits.value) * 100)
   return `${Math.max(pct, 6)}%`
}
</script>

<style scoped>
.fs-xs {
   font-size: 0.7rem;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.overview-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
}

.chart-container {
   height: 160px;
   border-bottom: 1px solid var(--app-border-color);
}

.bar-col {
   height: 100%;
}

.bar-wrapper {
   height: 100%;
}

.bar-item {
   width: 100%;
   max-width: 24px;
   background-color: var(--app-text-color);
   border-radius: 4px 4px 0 0;
   transition: height 0.3s ease;
}

.bar-item:hover {
   background-color: var(--app-accent-color);
}
</style>