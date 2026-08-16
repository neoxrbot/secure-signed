<template>
   <div class="container px-3 mb-5">
      <div class="profile-max-width mx-auto">
         <div class="profile-card shadow-sm mb-4">
            <div class="cover-banner" :style="{ backgroundImage: `url('${coverUrl}')` }"></div>
            <div class="p-4 pt-0 position-relative">
               <div class="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-3">
                  <div class="avatar-wrapper">
                     <img :src="avatarUrl" alt="Avatar" class="profile-avatar" />
                  </div>
                  <div class="d-flex gap-2 align-items-center">
                     <a href="https://github.com/neoxrbot" target="_blank" rel="noopener noreferrer"
                        class="btn btn-sm btn-outline-secondary btn-action">
                        <i class="bi bi-github"></i>
                        <span class="d-none d-sm-inline ms-1">GitHub</span>
                     </a>
                     <a href="https://t.me/neoxr" target="_blank" rel="noopener noreferrer"
                        class="btn btn-sm btn-custom-accent btn-action">
                        <i class="bi bi-telegram"></i>
                        <span class="ms-1">Contact</span>
                     </a>
                  </div>
               </div>

               <div class="mb-3">
                  <h4 class="fw-bold text-color mb-1">Wildan Izzudin</h4>
                  <p class="fs-xs text-accent font-monospace mb-1">@neoxr.js &middot; Full Stack Edge Engineer</p>
                  <p class="fs-xs text-muted mb-0">
                     <i class="bi bi-geo-alt me-1"></i> Indonesia &middot;
                     <span class="text-success fw-semibold"><i class="bi bi-circle-fill fs-xxs"></i> Available for
                        hire</span>
                  </p>
               </div>

               <p class="fs-sm text-muted mb-0 bio-text">
                  Passionate full-stack developer specializing in high-throughput cloud utilities, serverless edge
                  architectures, and reactive web applications with Nuxt, Cloudflare Workers, and D1 SQLite.
               </p>
            </div>
         </div>

         <div class="row g-4">
            <div class="col-lg-8 d-flex flex-column gap-4">
               <div class="content-card p-4 rounded-3">
                  <h6 class="fw-bold text-color mb-3 d-flex align-items-center gap-2">
                     <i class="bi bi-person-lines-fill text-accent"></i>
                     <span>About Portfolio</span>
                  </h6>
                  <p class="fs-sm text-muted mb-3">
                     Welcome to my developer ecosystem! This platform is engineered to provide fast, low-latency utility
                     services including batch file hosting, secure HMAC link signing, short URL redirection, and
                     interactive markdown note publishing.
                  </p>
                  <p class="fs-sm text-muted mb-0">
                     All systems run directly on Cloudflare Workers edge nodes to ensure global availability, minimal
                     latency, and zero cold starts.
                  </p>
               </div>

               <div class="content-card p-4 rounded-3">
                  <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                     <h6 class="fw-bold text-color mb-0 d-flex align-items-center gap-2">
                        <i class="bi bi-cpu-fill text-accent"></i>
                        <span>Tech Stack & Skillset</span>
                     </h6>
                     <span class="badge tech-count-badge">{{ skills.length }} Techs</span>
                  </div>
                  <div class="row g-2">
                     <div v-for="skill in skills" :key="skill.name" class="col-6 col-sm-3">
                        <div class="tech-chip p-2.5 rounded-3 d-flex align-items-center gap-2 h-100">
                           <div class="tech-icon-box">
                              <i :class="skill.icon"></i>
                           </div>
                           <div class="min-w-0">
                              <span class="fs-xs fw-bold text-color d-block text-truncate">{{ skill.name }}</span>
                              <span class="fs-xxs text-muted text-truncate font-monospace d-block">{{ skill.category
                                 }}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div class="content-card p-4 rounded-3">
                  <h6 class="fw-bold text-color mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                     <i class="bi bi-folder-symlink-fill text-accent"></i>
                     <span>Featured Projects</span>
                  </h6>
                  <div class="row g-3">
                     <div v-for="project in projects" :key="project.title" class="col-md-6">
                        <div class="project-box p-3 rounded-3 h-100 d-flex flex-column justify-content-between">
                           <div>
                              <div class="d-flex align-items-center justify-content-between mb-3">
                                 <div class="project-img-box">
                                    <img :src="project.image" :alt="project.title" class="project-img" />
                                 </div>
                                 <span class="fs-xxs font-monospace text-muted badge social-tag-badge">{{ project.tag
                                    }}</span>
                              </div>
                              <h6 class="fw-bold text-color mb-1 fs-sm">{{ project.title }}</h6>
                              <p class="fs-xs text-muted mb-3">{{ project.desc }}</p>
                           </div>
                           <NuxtLink :to="project.link"
                              class="btn btn-xs btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1">
                              <span>Open Tool</span>
                              <i class="bi bi-arrow-right"></i>
                           </NuxtLink>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="col-lg-4 d-flex flex-column gap-4">
               <div class="content-card p-4 rounded-3">
                  <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
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

                  <div class="d-flex flex-column gap-3">
                     <a v-for="social in socials" :key="social.name" :href="social.url" target="_blank"
                        rel="noopener noreferrer"
                        class="social-card rounded-3 text-decoration-none d-flex align-items-center justify-content-between">
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

               <LatestNotes domain="secure-signed.pages.dev" />
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref } from 'vue'
import { useHead } from '#app'

useHead({ title: 'Wildan Izzudin - Developer Profile' })

const coverUrl = ref('https://i.pinimg.com/originals/44/4b/8f/444b8f406347a470a7de5478206dd158.gif')
const avatarUrl = ref('https://i.pinimg.com/736x/4f/5a/f9/4f5af9b3660be51d37d3d6cce698a067.jpg')

const skills = [
   { name: 'Vue / Nuxt', category: 'Frontend', icon: 'bi bi-lightning-charge-fill' },
   { name: 'Workers', category: 'Edge Cloud', icon: 'bi bi-cpu-fill' },
   { name: 'D1 SQLite', category: 'Database', icon: 'bi bi-database-fill' },
   { name: 'Node / Nitro', category: 'Backend', icon: 'bi bi-server' },
   { name: 'JavaScript', category: 'Language', icon: 'bi bi-code-slash' },
   { name: 'Python', category: 'Scripting', icon: 'bi bi-terminal-fill' },
   { name: 'Bootstrap 5', category: 'UI Framework', icon: 'bi bi-bootstrap-fill' },
   { name: 'HMAC API', category: 'Security', icon: 'bi bi-shield-lock-fill' }
]

const projects = [
   {
      title: 'Developer Utility Engine',
      desc: 'Cloud batch file uploader, URL shortener & HMAC signer.',
      image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=400&q=80',
      tag: 'SYSTEM',
      link: '/'
   },
   {
      title: 'AI Assistant Chat',
      desc: 'Interactive markdown & media chatbot interface.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80',
      tag: 'AI CHAT',
      link: '/chat'
   },
   {
      title: 'Articles Library',
      desc: 'Public markdown notes reader with Plyr & Prism.',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80',
      tag: 'NOTES',
      link: '/notes'
   },
   {
      title: 'Admin Workspace',
      desc: 'Full studio for note editing, tags & database backups.',
      image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&q=80',
      tag: 'STUDIO',
      link: '/workspace'
   }
]

const socials = [
   { name: 'GitHub', handle: '@neoxrbot', icon: 'bi bi-github', url: 'https://github.com/neoxrbot' },
   { name: 'Telegram', handle: '@neoxr', icon: 'bi bi-telegram', url: 'https://t.me/neoxr' },
   { name: 'Twitter / X', handle: '@wildanizzudin', icon: 'bi bi-twitter-x', url: 'https://x.com' },
   { name: 'Email', handle: 'wildan@neoxr.eu', icon: 'bi bi-envelope-at-fill', url: 'mailto:wildan@neoxr.eu' }
]
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

.btn-xs {
   font-size: 0.75rem;
   padding: 0.2rem 0.5rem;
}

.profile-max-width {
   max-width: 860px;
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

.profile-card,
.content-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.75rem;
   overflow: hidden;
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
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
   display: block;
}

.btn-action {
   font-size: 0.775rem;
   padding: 0.35rem 0.85rem;
   border-radius: 0.4rem;
}

.bio-text {
   line-height: 1.6;
}

.tech-count-badge {
   font-size: 0.65rem;
   padding: 0.25rem 0.55rem;
   border-radius: 0.35rem;
   background-color: var(--app-bg);
   color: var(--app-accent-color);
   border: 1px solid var(--app-border-color);
}

.tech-chip {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   transition: all 0.2s ease;
}

.tech-chip:hover {
   background-color: var(--app-card-bg);
   border-color: var(--app-border-color);
   transform: translateY(-2px);
}

.tech-icon-box {
   width: 32px;
   height: 32px;
   min-width: 32px;
   border-radius: 0.375rem;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
   font-size: 0.95rem;
   flex-shrink: 0;
}

.project-box {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   transition: border-color 0.2s ease;
}

.project-box:hover {
   border-color: var(--app-accent-color);
}

.project-img-box {
   width: 42px;
   height: 42px;
   min-width: 42px;
   border-radius: 0.5rem;
   overflow: hidden;
   border: 1px solid var(--app-border-color);
   background-color: var(--app-card-bg);
   flex-shrink: 0;
}

.project-img {
   width: 100%;
   height: 100%;
   object-fit: cover;
   display: block;
}

.social-card {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   padding: 1.1rem 1.15rem !important;
   transition: all 0.25s ease;
}

.social-card:hover {
   background-color: var(--app-card-bg);
   border-color: var(--app-border-color);
   transform: translateX(3px);
}

.social-icon-box {
   width: 40px;
   height: 40px;
   min-width: 40px;
   border-radius: 0.5rem;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
   font-size: 1.15rem;
   flex-shrink: 0;
   transition: transform 0.2s ease;
}

.social-card:hover .social-icon-box {
   background-color: var(--app-bg);
   transform: scale(1.05);
}

.social-arrow-btn {
   width: 30px;
   height: 30px;
   min-width: 30px;
   border-radius: 50%;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-secondary-text-color);
   font-size: 0.8rem;
   flex-shrink: 0;
   transition: all 0.2s ease;
}

.social-card:hover .social-arrow-btn {
   color: var(--app-accent-color);
   border-color: var(--app-border-color);
   transform: translateX(2px);
}

.social-count-badge,
.social-tag-badge {
   font-size: 0.65rem;
   padding: 0.25rem 0.55rem;
   border-radius: 0.35rem;
   background-color: var(--app-bg);
   color: var(--app-accent-color);
   border: 1px solid var(--app-border-color);
}
</style>