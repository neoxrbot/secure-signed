<template>
   <transition name="fade">
      <div v-if="showPopup" class="mobile-prompt-overlay">
         <div class="prompt-wrapper">
            <button @click="dismissPopup" class="close-popup-btn" aria-label="Close">
               <i class="bi bi-x-lg"></i>
            </button>
            <div class="prompt-card content-card">
               <h5 class="mb-2">{{ config.public.popup.title }}</h5>
               <p class="prompt-text">
                  {{ config.public.popup.description }}
               </p>
               <div class="d-flex gap-2 mt-4">
                  <button @click="dismissPopup" class="btn btn-secondary w-100">
                     Maybe Later
                  </button>
                  <a :href="config.public.popup.link" target="_blank" rel="noopener noreferrer" @click="handleFollowClick"
                     class="btn btn-custom-accent fw-bold w-100">
                     <i class="bi bi-box-arrow-up-right me-2"></i>Visit
                  </a>
               </div>
            </div>
            <span class="sparkle"></span>
            <span class="sparkle"></span>
            <span class="sparkle"></span>
            <span class="sparkle"></span>
            <span class="sparkle"></span>
            <span class="sparkle"></span>
         </div>
      </div>
   </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const config = useRuntimeConfig()

const showPopup = ref(false)
const storageKey = 'popup_dismissed'

const dismissPopup = () => {
   localStorage.setItem(storageKey, 'true')
   showPopup.value = false
}

const handleFollowClick = () => {
   dismissPopup()
}

onMounted(() => {
   const isBrowser = typeof window !== 'undefined'
   if (isBrowser) {
      const isMobile = window.innerWidth < 768
      const hasDismissed = localStorage.getItem(storageKey) === 'true'
      if (isMobile && !hasDismissed) {
         setTimeout(() => {
            showPopup.value = true
         }, 1500)
      }
   }
})
</script>

<style scoped>
.mobile-prompt-overlay {
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   z-index: 1055;
   padding: 1rem;
   background-color: var(--app-overlay-bg);
   backdrop-filter: blur(5px);
   -webkit-backdrop-filter: blur(5px);
   display: flex;
   align-items: flex-end;
   justify-content: center;
}

body.light-mode .mobile-prompt-overlay {
   background-color: var(--app-overlay-bg);
}

.prompt-wrapper {
   position: relative;
   width: 100%;
   max-width: 500px;
   animation: slide-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.prompt-card {
   width: 100%;
   padding: 1.5rem;
   border-radius: 0.75rem;
   box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
   position: relative;
   overflow: hidden;
}

.prompt-card::before {
   content: '\F7EB';
   font-family: 'bootstrap-icons';
   font-weight: normal;
   position: absolute;
   z-index: 0;
   top: -20px;
   right: -30px;
   font-size: 150px;
   color: var(--dark-text-color);
   opacity: 0.05;
   transform: rotate(-15deg);
}

.prompt-card h5 {
   font-family: "Stack Sans Notch", sans-serif;
}

body.light-mode .prompt-card::before {
   color: var(--light-text-color);
}

body.light-mode .prompt-card {
   box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.1);
}

.prompt-text {
   color: var(--dark-secondary-text-color);
   font-size: 0.95rem;
   line-height: 1.5;
   position: relative;
   z-index: 1;
}

body.light-mode .prompt-text {
   color: var(--light-text-color);
   opacity: 0.9;
}

.close-popup-btn {
   position: absolute;
   top: -10px;
   right: -5px;
   z-index: 10;
   width: 32px;
   height: 32px;
   border-radius: 50%;
   border: 1px solid var(--dark-border-color);
   background-color: var(--dark-bg);
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: background-color 0.2s ease;
}

.close-popup-btn i {
   font-size: 1.1rem;
   color: var(--dark-secondary-text-color);
   transition: color 0.2s ease;
}

.close-popup-btn:hover {
   background-color: var(--dark-border-color);
}

.close-popup-btn:hover i {
   color: var(--dark-text-color);
}

body.light-mode .close-popup-btn {
   background-color: var(--light-bg);
   border-color: var(--light-border-color);
}

body.light-mode .close-popup-btn i {
   color: #6c757d;
}

body.light-mode .close-popup-btn:hover {
   background-color: #e9ecef;
}

body.light-mode .close-popup-btn:hover i {
   color: var(--light-text-color);
}

.sparkle {
   position: absolute;
   width: 10px;
   height: 10px;
   opacity: 0;
   animation: sparkle-effect 1.5s ease-out infinite;
}

.sparkle::before,
.sparkle::after {
   content: '';
   position: absolute;
   background-color: var(--dark-primary-accent);
}

body.light-mode .sparkle::before,
body.light-mode .sparkle::after {
   background-color: var(--light-primary);
}

.sparkle::before {
   width: 100%;
   height: 2px;
   top: 4px;
}

.sparkle::after {
   width: 2px;
   height: 100%;
   left: 4px;
}

@keyframes sparkle-effect {
   0% {
      opacity: 0;
      transform: scale(0) rotate(0deg);
   }

   50% {
      opacity: 1;
      transform: scale(1.2) rotate(180deg);
   }

   100% {
      opacity: 0;
      transform: scale(0) rotate(360deg);
   }
}

.sparkle:nth-of-type(1) {
   top: -5%;
   left: 10%;
   animation-duration: 2.5s;
   animation-delay: 0.5s;
}

.sparkle:nth-of-type(2) {
   top: 20%;
   left: -10%;
   animation-duration: 3s;
   animation-delay: 0.8s;
}

.sparkle:nth-of-type(3) {
   top: 50%;
   right: -5%;
   animation-duration: 2s;
   animation-delay: 0.6s;
}

.sparkle:nth-of-type(4) {
   top: 80%;
   left: 15%;
   animation-duration: 3.5s;
   animation-delay: 1.2s;
}

.sparkle:nth-of-type(5) {
   bottom: -5%;
   right: 20%;
   animation-duration: 2.2s;
   animation-delay: 0.7s;
}

.sparkle:nth-of-type(6) {
   bottom: 30%;
   right: -8%;
   animation-duration: 3.2s;
   animation-delay: 1.5s;
}
</style>