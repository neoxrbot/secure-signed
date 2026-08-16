<template>
   <div class="profile-socials-container">
      <div class="d-flex align-items-center justify-content-between mb-3">
         <div class="d-flex align-items-center gap-2">
            <div class="card-icon-box">
               <i class="bi bi-share-fill"></i>
            </div>
            <div>
               <h6 class="fw-bold text-color mb-0">Connects</h6>
               <span class="fs-xxs text-muted">Direct channels</span>
            </div>
         </div>
         <span class="badge social-count-badge">{{ socials.length }} Channels</span>
      </div>

      <div class="d-flex flex-column gap-2">
         <a v-for="social in socials" :key="social.name" :href="social.url" target="_blank" rel="noopener noreferrer"
            class="social-item rounded-3 text-decoration-none d-flex align-items-center justify-content-between p-3">
            <div class="d-flex align-items-center gap-3 min-w-0">
               <div class="social-icon-box">
                  <i :class="social.icon"></i>
               </div>
               <div class="min-w-0">
                  <span class="fs-xs fw-bold text-color d-block mb-0.5">{{ social.name }}</span>
                  <div class="fs-xxs text-muted text-truncate font-monospace">{{ social.handle }}</div>
               </div>
            </div>
            <div class="social-arrow-btn">
               <i class="bi bi-chevron-right"></i>
            </div>
         </a>
      </div>
   </div>
</template>

<script setup lang="ts">
interface Social {
   name: string
   handle: string
   icon: string
   url: string
}

const socials: Social[] = [
   { name: 'GitHub', handle: '@neoxr', icon: 'bi bi-github', url: 'https://github.com/neoxr' },
   { name: 'Telegram', handle: '@neoxr', icon: 'bi bi-telegram', url: 'https://t.me/neoxr' },
   { name: 'Instagram', handle: '@neoxr.creative', icon: 'bi bi-instagram', url: 'https://instagram.com/neoxr.creative' },
   { name: 'Email', handle: 'contact@neoxr.eu', icon: 'bi bi-envelope-at-fill', url: 'mailto:contact@neoxr.eu' }
]
</script>

<style scoped>
.fs-xxs {
   font-size: 0.65rem;
}

.fs-xs {
   font-size: 0.75rem;
}

.min-w-0 {
   min-width: 0;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.card-icon-box {
   width: 32px;
   height: 32px;
   border-radius: 0.375rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
   font-size: 0.9rem;
}

.social-item {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   transition: transform 0.25s ease, background-color 0.25s ease;
}

.social-item:hover {
   transform: translateX(3px);
}

.social-icon-box {
   width: 38px;
   height: 38px;
   min-width: 38px;
   border-radius: 0.5rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
   font-size: 1.1rem;
   flex-shrink: 0;
   transition: transform 0.2s ease;
}

.social-item:hover .social-icon-box {
   transform: scale(1.05);
}

.social-arrow-btn {
   width: 28px;
   height: 28px;
   min-width: 28px;
   border-radius: 50%;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-secondary-text-color);
   font-size: 0.8rem;
   flex-shrink: 0;
   transition: transform 0.2s ease, color 0.2s ease;
}

.social-item:hover .social-arrow-btn {
   color: var(--app-accent-color);
   transform: translateX(2px);
}

.social-count-badge {
   font-size: 0.65rem;
   padding: 0.25rem 0.55rem;
   border-radius: 0.35rem;
   background-color: var(--app-bg);
   color: var(--app-accent-color);
   border: 1px solid var(--app-border-color);
}
</style>