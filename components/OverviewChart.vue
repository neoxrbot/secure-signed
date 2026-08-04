<template>
   <div class="overview-card p-3 rounded-3">
      <div class="d-flex align-items-center justify-content-between mb-3">
         <div>
            <span class="fs-xs text-muted text-uppercase fw-bold tracking-wider">Weekly Requests</span>
            <h4 class="fw-bold text-color mb-0">{{ totalHits.toLocaleString() }}</h4>
         </div>
         <span class="badge bg-accent-subtle text-accent px-2 py-1 fs-xs fw-semibold">Last 8 Days</span>
      </div>

      <div class="chart-body d-flex align-items-end justify-content-between gap-2 pt-3 pb-1 border-bottom">
         <div v-for="(item, idx) in chartData" :key="idx"
            class="bar-col d-flex flex-column align-items-center flex-grow-1">
            <span class="fs-xxs text-muted mb-1 fw-bold">{{ formatNum(item.hits) }}</span>
            <div class="bar-track w-100 d-flex align-items-end justify-content-center">
               <div class="bar-fill" :style="{ height: getBarHeight(item.hits) }"
                  :title="`${item.date}: ${item.hits} hits`"></div>
            </div>
            <span class="fs-xs text-muted mt-2 fw-semibold">{{ item.day }}</span>
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

const formatNum = (num) => {
   if (!num) return '0'
   if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
   return num.toString()
}
</script>

<style scoped>
.fs-xxs {
   font-size: 0.65rem;
}

.fs-xs {
   font-size: 0.725rem;
}

.tracking-wider {
   letter-spacing: 0.05em;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-accent {
   color: var(--app-accent-color) !important;
}

.bg-accent-subtle {
   background-color: rgba(255, 255, 255, 0.08) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.border-bottom {
   border-color: var(--app-border-color) !important;
}

.overview-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
}

.chart-body {
   height: 150px;
}

.bar-track {
   height: 90px;
}

.bar-fill {
   width: 100%;
   max-width: 22px;
   background-color: var(--app-accent-color, #0d6efd);
   border-radius: 4px 4px 0 0;
   transition: height 0.3s ease;
}

.bar-col:hover .bar-fill {
   opacity: 0.8;
}
</style>