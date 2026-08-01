<template>
   <div class="api-overview-card d-flex flex-column">
      <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
         <div class="d-flex align-items-center gap-2">
            <h6 class="mb-0 fw-bold text-color">Overview</h6>
         </div>
         <button class="btn btn-sm btn-outline-secondary btn-icon-only" @click="emit('refresh')" :disabled="isLoading"
            title="Refresh Stats">
            <i class="bi bi-arrow-repeat" :class="{ 'spin': isLoading }"></i>
         </button>
      </div>

      <div class="p-4 d-flex flex-column gap-3">
         <div class="row g-3">
            <div class="col-6">
               <div class="api-metric-box">
                  <span class="api-metric-label">Hits Today</span>
                  <h5 class="api-metric-value text-accent mb-0">{{ (stats.hitsToday || 0).toLocaleString() }}</h5>
               </div>
            </div>
            <div class="col-6">
               <div class="api-metric-box">
                  <span class="api-metric-label">Short URLs</span>
                  <h5 class="api-metric-value mb-0">{{ (stats.totalShorts || 0).toLocaleString() }}</h5>
               </div>
            </div>
            <div class="col-6">
               <div class="api-metric-box">
                  <span class="api-metric-label">URL Views</span>
                  <h5 class="api-metric-value mb-0">{{ (stats.totalViews || 0).toLocaleString() }}</h5>
               </div>
            </div>
            <div class="col-6">
               <div class="api-metric-box">
                  <span class="api-metric-label">Proxied Req</span>
                  <h5 class="api-metric-value mb-0">{{ (stats.totalProxied || 0).toLocaleString() }}</h5>
               </div>
            </div>
         </div>

         <div class="api-status-banner p-3 rounded d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
               <i class="bi bi-shield-check text-success fs-5"></i>
               <div>
                  <div class="fs-xs fw-bold text-color">Service Status</div>
                  <div class="fs-xs text-muted">All endpoints operational</div>
               </div>
            </div>
            <span
               class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-xs">Active</span>
         </div>

         <div class="api-spec-list border-top pt-3">
            <div class="d-flex justify-content-between align-items-center fs-xs mb-2">
               <span class="text-muted"><i class="bi bi-code-slash me-1"></i> REST API Format</span>
               <span class="fw-semibold text-color">JSON</span>
            </div>
            <div class="d-flex justify-content-between align-items-center fs-xs mb-2">
               <span class="text-muted"><i class="bi bi-lightning-charge me-1"></i> Speed Limit</span>
               <span class="fw-semibold text-color">Unlimited</span>
            </div>
            <div class="d-flex justify-content-between align-items-center fs-xs">
               <span class="text-muted"><i class="bi bi-lock me-1"></i> Signature Support</span>
               <span class="fw-semibold text-color">HMAC-SHA256</span>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
defineProps<{
   stats: Record<string, any>
   isLoading?: boolean
}>()

const emit = defineEmits(['refresh'])
</script>

<style scoped>
.fs-xs {
   font-size: 0.75rem;
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

.api-overview-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.625rem;
   overflow: hidden;
}

.btn-icon-only {
   width: 32px;
   height: 32px;
   padding: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 0.375rem;
}

.api-metric-box {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.5rem;
   padding: 0.85rem;
}

.api-metric-label {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color) !important;
   text-transform: uppercase;
   font-weight: 600;
   display: block;
   margin-bottom: 0.2rem;
}

.api-metric-value {
   font-weight: 700;
   color: var(--app-text-color);
}

.api-status-banner {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
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