<template>
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
                  <span class="fs-xxs text-muted text-truncate font-monospace d-block">{{ skill.category }}</span>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
interface Skill {
   name: string
   category: string
   icon: string
}

const skills: Skill[] = [
   { name: 'Vue / Nuxt', category: 'Frontend', icon: 'bi bi-lightning-charge-fill' },
   { name: 'Workers', category: 'Edge Cloud', icon: 'bi bi-cpu-fill' },
   { name: 'D1 SQLite', category: 'Database', icon: 'bi bi-database-fill' },
   { name: 'Node / Nitro', category: 'Backend', icon: 'bi bi-server' },
   { name: 'JavaScript', category: 'Language', icon: 'bi bi-code-slash' },
   { name: 'Python', category: 'Scripting', icon: 'bi bi-terminal-fill' },
   { name: 'Bootstrap 5', category: 'UI Framework', icon: 'bi bi-bootstrap-fill' },
   { name: 'HMAC API', category: 'Security', icon: 'bi bi-shield-lock-fill' }
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

.text-accent {
   color: var(--app-accent-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.border-bottom {
   border-color: var(--app-border-color) !important;
}

.content-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.75rem;
   overflow: hidden;
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
</style>