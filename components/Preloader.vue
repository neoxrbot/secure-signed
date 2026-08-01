<template>
   <transition name="fade">
      <div v-if="uiStore.isInitialLoading" class="preloader-overlay">
         <div class="preloader-card">
            <div class="card-brand">
               <div class="brand-icon">
                  <i class="bi bi-terminal-fill"></i>
               </div>
               <div class="brand-info">
                  <span class="brand-title">Initializing Service</span>
                  <span class="brand-sub">Preparing workspace environment</span>
               </div>
            </div>
            <div class="progress-track">
               <div class="progress-bar"></div>
            </div>
         </div>
      </div>
   </transition>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
onMounted(() => {
   setTimeout(() => { uiStore.finishInitialLoading() }, 2000)
})
</script>

<style scoped>
.preloader-overlay {
   position: fixed;
   top: 0;
   left: 0;
   width: 100vw;
   height: 100vh;
   background-color: var(--app-bg);
   display: flex;
   justify-content: center;
   align-items: center;
   z-index: 999999;
}

.preloader-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.75rem;
   padding: 1.25rem 1.5rem;
   width: 300px;
   display: flex;
   flex-direction: column;
   gap: 1.25rem;
}

.card-brand {
   display: flex;
   align-items: center;
   gap: 0.85rem;
}

.brand-icon {
   width: 38px;
   height: 38px;
   border-radius: 0.5rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
   font-size: 1.1rem;
}

.brand-info {
   display: flex;
   flex-direction: column;
}

.brand-title {
   font-size: 0.875rem;
   font-weight: 700;
   color: var(--app-text-color);
   line-height: 1.2;
}

.brand-sub {
   font-size: 0.725rem;
   color: var(--app-secondary-text-color) !important;
}

.progress-track {
   width: 100%;
   height: 4px;
   background-color: var(--app-bg);
   border-radius: 10px;
   overflow: hidden;
   position: relative;
}

.progress-bar {
   position: absolute;
   top: 0;
   left: 0;
   height: 100%;
   width: 40%;
   background-color: var(--app-accent-color);
   border-radius: 10px;
   animation: slide 1.2s infinite ease-in-out;
}

@keyframes slide {
   0% {
      left: -40%;
      width: 30%;
   }

   50% {
      width: 60%;
   }

   100% {
      left: 100%;
      width: 30%;
   }
}

.fade-leave-active {
   transition: opacity 0.4s ease;
}

.fade-leave-to {
   opacity: 0;
}
</style>