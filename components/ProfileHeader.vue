<template>
   <div class="profile-card mb-4">
      <div class="cover-banner" :style="{ backgroundImage: `url('${coverUrl}')` }"></div>
      <div class="p-4 pt-0 position-relative">
         <div class="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-3">
            <div class="avatar-wrapper">
               <img :src="avatarUrl" alt="Avatar" class="profile-avatar" />
            </div>
            <div class="d-flex gap-2 align-items-center">
               <a href="https://github.com/neoxr" target="_blank" rel="noopener noreferrer"
                  class="btn btn-sm btn-outline-secondary btn-action">
                  <i class="bi bi-github"></i>
                  <span class="d-none d-sm-inline ms-1">GitHub</span>
               </a>
               <a href="https://wa.me/sean.rey" target="_blank" rel="noopener noreferrer"
                  class="btn btn-sm btn-custom-accent btn-action">
                  <i class="bi bi-whatsapp"></i>
                  <span class="ms-1">Contact</span>
               </a>
            </div>
         </div>

         <div class="mb-3">
            <div class="d-flex align-items-center gap-2 mb-1">
               <h4 class="fw-bold text-color mb-0">Wildan Izzudin</h4>
               <i class="bi bi-patch-check-fill verified-badge" title="Verified Developer"></i>
            </div>
            <p class="fs-xs text-accent mb-1">
               <a href="https://instagram.com/neoxr.js" target="_blank" rel="noopener noreferrer"
                  class="handle-link">@neoxr.js</a> &middot; Web & Bot Developer
            </p>
            <div class="d-flex align-items-center gap-2 flex-wrap fs-xs text-muted">
               <span><i class="bi bi-geo-alt me-1"></i> Indonesia</span>
               <span>&middot;</span>
               <button type="button" @click="toggleAudio" class="audio-badge-btn" :class="{ 'is-playing': isPlaying }"
                  :disabled="isAudioLoading" :title="isPlaying ? 'Pause Audio' : 'Play Audio'">
                  <span v-if="isAudioLoading" class="spinner-border spinner-border-sm" role="status"
                     style="width: 10px; height: 10px;"></span>
                  <i v-else class="bi" :class="isPlaying ? 'bi-pause-fill' : 'bi-play-fill'"></i>
                  <span>{{ isAudioLoading ? 'Loading...' : isPlaying ? 'Pause Audio' : 'Audio Profile' }}</span>
                  <span class="music-wave" v-if="isPlaying && !isAudioLoading">
                     <span></span><span></span><span></span>
                  </span>
               </button>
            </div>
         </div>

         <p class="fs-sm text-muted mb-0 bio-text">
            Full-stack developer focused on building modern and scalable web applications with Nuxt, developing
            WhatsApp bots, and integrating reliable WhatsApp gateway solutions for seamless automation and
            communication.
         </p>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const coverUrl = ref('https://i.pinimg.com/originals/44/4b/8f/444b8f406347a470a7de5478206dd158.gif')
const avatarUrl = ref('https://i.pinimg.com/originals/49/2b/d9/492bd933d364679be2379b3b3d725be7.gif')
const audioUrl = 'https://secure-signed.pages.dev/file/CQACAgUAAxkDAAEBYclqgZCMGysZndw4MzlxXhJ7rCPE-QAC4CsAAsrwCVSuBds--BSrij0E'

const isPlaying = ref(false)
const isAudioLoading = ref(false)
let audioInstance: HTMLAudioElement | null = null

const toggleAudio = () => {
   if (isAudioLoading.value) return

   if (!audioInstance) {
      isAudioLoading.value = true
      audioInstance = new Audio(audioUrl)
      audioInstance.onended = () => {
         isPlaying.value = false
         isAudioLoading.value = false
      }
      audioInstance.onerror = () => {
         isPlaying.value = false
         isAudioLoading.value = false
      }
      audioInstance.onwaiting = () => {
         isAudioLoading.value = true
      }
      audioInstance.onplaying = () => {
         isAudioLoading.value = false
         isPlaying.value = true
      }
   }

   if (isPlaying.value) {
      audioInstance.pause()
      isPlaying.value = false
      isAudioLoading.value = false
   } else {
      isAudioLoading.value = true
      audioInstance.play().then(() => {
         isAudioLoading.value = false
         isPlaying.value = true
      }).catch(() => {
         isAudioLoading.value = false
         isPlaying.value = false
      })
   }
}

onUnmounted(() => {
   if (audioInstance) {
      audioInstance.pause()
      audioInstance = null
   }
})
</script>

<style scoped>
.fs-xxs {
   font-size: 0.65rem;
}

.fs-xs {
   font-size: 0.75rem;
}

.fs-sm {
   font-size: 0.875rem;
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

.handle-link {
   color: inherit;
   text-decoration: none;
   transition: opacity 0.2s ease;
}

.handle-link:hover {
   text-decoration: underline;
   opacity: 0.85;
}

.profile-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.75rem;
   overflow: hidden;
}

.cover-banner {
   height: 200px;
   background-size: cover;
   background-position: center;
   border-bottom: 1px solid var(--app-border-color);
}

.avatar-wrapper {
   margin-top: -52px;
}

.profile-avatar {
   width: 104px;
   height: 104px;
   min-width: 104px;
   min-height: 104px;
   border-radius: 50% !important;
   object-fit: cover !important;
   aspect-ratio: 1 / 1 !important;
   border: 4px solid var(--app-card-bg);
   background-color: var(--app-bg);
   display: block;
}

.verified-badge {
   color: #1d9bf0;
   font-size: 1.1rem;
   line-height: 1;
   transform: translateY(1.5px);
}

.btn-action {
   font-size: 0.775rem;
   padding: 0.35rem 0.85rem;
   border-radius: 0.4rem;
}

.bio-text {
   line-height: 1.6;
}

.audio-badge-btn {
   display: inline-flex;
   align-items: center;
   gap: 0.35rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   color: var(--app-text-color);
   padding: 0.15rem 0.6rem;
   border-radius: 50px;
   font-size: 0.7rem;
   font-weight: 600;
   cursor: pointer;
   transition: background-color 0.2s ease, color 0.2s ease;
}

.audio-badge-btn:hover {
   color: var(--app-accent-color);
}

.audio-badge-btn.is-playing {
   background-color: var(--app-card-bg);
   color: var(--app-accent-color);
}

.music-wave {
   display: inline-flex;
   align-items: flex-end;
   gap: 2px;
   height: 10px;
   margin-left: 2px;
}

.music-wave span {
   width: 2px;
   height: 100%;
   background-color: var(--app-accent-color);
   border-radius: 2px;
   animation: bounce 0.8s infinite ease-in-out alternate;
}

.music-wave span:nth-child(2) {
   animation-delay: 0.2s;
}

.music-wave span:nth-child(3) {
   animation-delay: 0.4s;
}

@keyframes bounce {
   0% {
      height: 30%;
   }

   100% {
      height: 100%;
   }
}
</style>