<template>
   <div class="overview-card p-3 rounded-3" ref="chartRef">
      <div class="d-flex align-items-center justify-content-between mb-3">
         <div>
            <span class="fs-xs text-muted text-uppercase fw-bold tracking-wider">Weekly Requests</span>
            <h4 class="fw-bold text-color mb-0">{{ totalHits.toLocaleString() }}</h4>
         </div>
         <span class="badge bg-accent-subtle text-accent px-2 py-1 fs-xs fw-semibold">Last 7 Days</span>
      </div>

      <div class="chart-body d-flex align-items-end justify-content-between gap-2 pt-3 pb-1 border-bottom">
         <div v-for="(item, idx) in chartData" :key="idx"
            class="bar-col d-flex flex-column align-items-center flex-grow-1 position-relative"
            :class="{ 'active': activeIndex === idx }" @click="selectColumn(idx, $event)">

            <Transition name="tooltip-fade">
               <div class="custom-tooltip" v-if="activeIndex === idx">
                  <div class="tooltip-header">{{ item.date || item.day }}</div>
                  <div class="tooltip-row">Hits: <strong>{{ (item.hits || 0).toLocaleString() }}</strong></div>
               </div>
            </Transition>

            <div class="d-flex gap-1 mb-1">
               <span class="fs-xxs text-muted fw-bold">{{ formatNum(item.hits) }}</span>
            </div>
            <div class="bar-track w-100 d-flex align-items-end justify-content-center">
               <div class="bar-fill" :style="{ height: getBarHeight(item.hits) }"></div>
            </div>
            <span class="fs-xs text-muted mt-2 fw-semibold">{{ item.day }}</span>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
   data: { type: Array, default: () => [] },
   chartApiData: { type: Object, default: null }
})

const chartRef = ref(null)
const activeIndex = ref(null)
let autoHideTimer = null

const selectColumn = (idx, event) => {
   if (event) {
      event.stopPropagation()
   }
   if (autoHideTimer) {
      clearTimeout(autoHideTimer)
   }
   if (activeIndex.value === idx) {
      activeIndex.value = null
   } else {
      activeIndex.value = idx
      autoHideTimer = setTimeout(() => {
         activeIndex.value = null
      }, 3500)
   }
}

const handleClickOutside = (event) => {
   if (chartRef.value && !chartRef.value.contains(event.target)) {
      activeIndex.value = null
      if (autoHideTimer) {
         clearTimeout(autoHideTimer)
      }
   }
}

onMounted(() => {
   document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
   document.removeEventListener('click', handleClickOutside, true)
   if (autoHideTimer) {
      clearTimeout(autoHideTimer)
   }
})

const chartData = computed(() => {
   if (props.data && props.data.length > 0) return props.data
   if (!props.chartApiData) return []
   try {
      const labels = JSON.parse(props.chartApiData.week || '[]')
      const requestData = JSON.parse(props.chartApiData.request || '[]')
      return labels.map((date, idx) => ({
         day: date,
         date: date,
         hits: Number(requestData[idx]) || 0
      }))
   } catch (e) {
      return []
   }
})

const totalHits = computed(() => {
   return chartData.value.reduce((acc, curr) => acc + (curr.hits || 0), 0)
})

const maxHits = computed(() => {
   if (chartData.value.length === 0) return 1
   return Math.max(...chartData.value.map(d => d.hits || 0), 1)
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

body.light-mode .bg-accent-subtle {
   background-color: rgba(0, 0, 0, 0.06) !important;
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

.bar-col {
   cursor: pointer;
}

.bar-fill {
   width: 100%;
   max-width: 22px;
   background-color: var(--app-accent-color, #0d6efd);
   border-radius: 4px 4px 0 0;
   transition: height 0.3s ease, opacity 0.2s ease;
}

.bar-col:hover .bar-fill,
.bar-col.active .bar-fill {
   opacity: 0.8;
}

.custom-tooltip {
   position: absolute;
   bottom: 100%;
   left: 50%;
   transform: translateX(-50%);
   margin-bottom: 8px;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   color: var(--app-text-color);
   padding: 0.35rem 0.55rem;
   border-radius: 6px;
   font-size: 0.65rem;
   line-height: 1.25;
   white-space: nowrap;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
   z-index: 10;
   pointer-events: none;
}

.custom-tooltip::after {
   content: '';
   position: absolute;
   top: 100%;
   left: 50%;
   transform: translateX(-50%);
   border-width: 4px;
   border-style: solid;
   border-color: var(--app-border-color) transparent transparent transparent;
}

.tooltip-header {
   font-weight: 700;
   margin-bottom: 2px;
   color: var(--app-secondary-text-color);
}

.tooltip-row strong {
   color: var(--app-text-color);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
   transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
   opacity: 0;
   transform: translate(-50%, 4px) scale(0.95);
}
</style>