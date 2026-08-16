<template>
   <div class="profile-projects-container">
      <div class="d-flex align-items-center justify-content-between mb-3">
         <div class="d-flex align-items-center">
            <div class="section-icon me-2">
               <i class="bi bi-folder-symlink-fill"></i>
            </div>
            <h6 class="section-title mb-0 fw-bold text-color">Featured Projects</h6>
         </div>
         <span class="badge count-badge">{{ projects.length }} Projects</span>
      </div>

      <div class="row g-3">
         <div v-for="project in projects" :key="project.title" class="col-md-6">
            <div class="project-box p-3 rounded-3 h-100 d-flex flex-column justify-content-between">
               <div>
                  <div class="d-flex align-items-center justify-content-between mb-3">
                     <div class="project-img-box">
                        <img :src="project.image" :alt="project.title" class="project-img" />
                     </div>
                     <span class="fs-xxs font-monospace text-muted badge social-tag-badge">{{ project.tag }}</span>
                  </div>
                  <h6 class="fw-bold text-color mb-1 fs-sm">{{ project.title }}</h6>
                  <p class="fs-xs text-muted mb-2">{{ project.desc }}</p>
               </div>
               <NuxtLink :to="project.link"
               target="_blank" rel="noopener noreferrer"
                  class="btn btn-xs btn-outline-secondary d-inline-flex align-items-center gap-1"
                  style="width: fit-content;">
                  <span>Visit</span>
                  <i class="bi bi-arrow-right"></i>
               </NuxtLink>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
interface Project {
   title: string
   desc: string
   image: string
   tag: string
   link: string
}

const projects: Project[] = [
   {
      title: '@neoxr/wb',
      desc: 'WhatsApp Bot framework and multi-device automation library for Node.js.',
      image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=400&q=80',
      tag: 'NPM',
      link: 'http://npmjs.com/package/@neoxr/wb'
   },
   {
      title: 'Neoxr Bot',
      desc: 'WhatsApp Bot powered by @neoxr/wb with a modular plugin system.',
      image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=400&q=80',
      tag: 'BOT',
      link: 'https://github.com/neoxr/neoxr-bot'
   },
   {
      title: '@neoxr/webly',
      desc: 'Lightweight web utility package for building and managing modern web applications',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
      tag: 'NPM',
      link: 'https://www.npmjs.com/package/@neoxr/webly'
   },
   {
      title: 'Open API',
      desc: 'A Node.js backend framework for building modern web applications and RESTful APIs.',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
      tag: 'WEB',
      link: 'https://github.com/neoxr/open-api'
   },
]
</script>

<style scoped>
.section-icon {
   width: 32px;
   height: 32px;
   display: flex;
   align-items: center;
   justify-content: center;
   background-color: var(--app-bg);
   border-radius: 0.375rem;
   border: 1px solid var(--app-border-color);
   color: var(--app-accent-color);
   font-size: 0.9rem;
}

.count-badge {
   background-color: var(--app-bg);
   color: var(--app-secondary-text-color);
   border: 1px solid var(--app-border-color);
   font-weight: 500;
   font-size: 0.65rem;
   padding: 0.25rem 0.55rem;
   border-radius: 0.35rem;
}

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
   padding: 0.25rem 0.65rem;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.project-box {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   transition: transform 0.2s ease, background-color 0.2s ease;
}

.project-box:hover {
   transform: translateY(-2px);
}

.project-img-box {
   width: 42px;
   height: 42px;
   min-width: 42px;
   border-radius: 0.5rem;
   overflow: hidden;
   border: 1px solid var(--app-border-color);
   background-color: var(--app-bg);
   flex-shrink: 0;
}

.project-img {
   width: 100%;
   height: 100%;
   object-fit: cover;
   display: block;
}

.social-tag-badge {
   font-size: 0.65rem;
   padding: 0.25rem 0.55rem;
   border-radius: 0.35rem;
   background-color: var(--app-bg);
   color: var(--app-accent-color);
   border: 1px solid var(--app-border-color);
}

.btn-outline-secondary {
   background-color: var(--app-bg);
   color: var(--app-secondary-text-color);
   border-color: var(--app-border-color);
}

.btn-outline-secondary:hover {
   background-color: var(--app-card-bg);
   color: var(--app-text-color);
   border-color: var(--app-border-color);
}
</style>