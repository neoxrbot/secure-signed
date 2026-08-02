<template>
   <div>
      <Preloader />

      <nav class="navbar fixed-top py-3 transition-all" :class="{ 'scrolled-nav': isScrolled }">
         <div class="container px-3">
            <NuxtLink to="/" class="navbar-brand main-title mb-0 d-flex align-items-center gap-2">
               {{ config.public.title }}
            </NuxtLink>

            <div class="d-flex align-items-center gap-3">
               <div class="d-none d-md-flex align-items-center">
                  <ul class="navbar-nav flex-row gap-2">
                     <li v-for="link in navLinks" :key="link.text" class="nav-item">
                        <button v-if="link.action === 'logout'" class="nav-link custom-link border-0 bg-transparent"
                           @click="handleLogout">
                           {{ link.text }}
                        </button>
                        <a v-else-if="isExternalLink(link.href)" class="nav-link custom-link" :href="link.href"
                           target="_blank">
                           {{ link.text }}
                        </a>
                        <NuxtLink v-else class="nav-link custom-link" :to="link.href" active-class="active">
                           {{ link.text }}
                        </NuxtLink>
                     </li>
                  </ul>
               </div>
               <Theme />
               <button class="navbar-toggler d-md-none border-0 p-0" type="button" @click="toggleSidebar">
                  <i class="bi bi-three-dots fs-1 text-primary-color"></i>
               </button>
            </div>
         </div>
      </nav>

      <Transition name="fade">
         <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
      </Transition>

      <div ref="mobileSidebarRef" class="offcanvas offcanvas-start full-sidebar" tabindex="-1" id="mobileSidebar">
         <div class="offcanvas-body d-flex flex-column p-3">
            <div class="sidebar-header">
               <div>
                  <h5 class="main-title mb-1">{{ config.public.title }}</h5>
                  <p class="sidebar-desc mb-0">{{ config.public.tagline }}</p>
               </div>
               <button type="button" class="btn-close-custom" @click="closeSidebar">
                  <i class="bi bi-x-lg"></i>
               </button>
            </div>

            <ul class="nav flex-column gap-2 mt-4">
               <li v-for="link in navLinks" :key="link.text" class="nav-item">
                  <button v-if="link.action === 'logout'"
                     class="nav-link sidebar-pill border-0 bg-transparent w-100 text-start"
                     @click="handleLogout(); closeSidebar()">
                     <div class="d-flex align-items-center">
                        <span class="icon-box"><i :class="link.icon"></i></span>
                        {{ link.text }}
                     </div>
                  </button>
                  <a v-else-if="isExternalLink(link.href)" class="nav-link sidebar-pill" :href="link.href"
                     target="_blank">
                     <div class="d-flex align-items-center">
                        <span class="icon-box"><i :class="link.icon"></i></span>
                        {{ link.text }}
                     </div>
                     <i class="bi bi-box-arrow-up-right small opacity-50"></i>
                  </a>
                  <NuxtLink v-else class="nav-link sidebar-pill" :to="link.href" active-class="active"
                     @click="closeSidebar">
                     <div class="d-flex align-items-center">
                        <span class="icon-box"><i :class="link.icon"></i></span>
                        {{ link.text }}
                     </div>
                  </NuxtLink>
               </li>
            </ul>

            <div class="mt-auto">
               <a href="https://shop.neoxr.eu" class="shop-card" target="_blank">
                  <i class="bi bi-emoji-neutral faded-icon"></i>
                  <div class="d-flex align-items-center justify-content-between shop-content">
                     <div>
                        <span class="d-block fw-bold shop-title">Shop Now</span>
                        <small class="shop-desc">Get the Script</small>
                     </div>
                     <div class="icon-circle">
                        <i class="bi bi-arrow-right"></i>
                     </div>
                  </div>
               </a>
            </div>
         </div>
      </div>

      <div class="page-content">
         <NuxtPage />
      </div>

      <OneTimePopup />
   </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRuntimeConfig, useRoute, useRouter, useNuxtApp, useState } from '#app'
import { usePageEffects } from '@/composables/usePageEffects'
import { Offcanvas } from 'bootstrap'

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { isScrolled } = usePageEffects()

const mobileSidebarRef = ref<HTMLElement | null>(null)
let mobileSidebarInstance: Offcanvas | null = null
const isSidebarOpen = ref(false)

const isAdmin = useState<boolean>('admin-status', () => false)

const navLinks = computed(() => {
   const links = [
      { text: 'Home', href: '/', icon: 'bi bi-house' },
      { text: 'Documentation', href: '/docs', icon: 'bi bi-book' }
   ]

   if (isAdmin.value) {
      links.push({ text: 'Workspace', href: '/workspace', icon: 'bi bi-person-badge-fill' })
      links.push({ text: 'Logout', href: '#', icon: 'bi bi-box-arrow-right', action: 'logout' })
   } else {
      links.push({ text: 'Login', href: '/login', icon: 'bi bi-shield-lock-fill' })
   }

   return links
})

const checkAdminStatus = async () => {
   try {
      const r: any = await $api('/api/admin/me')
      isAdmin.value = !!r?.data?.admin
   } catch {
      isAdmin.value = false
   }
}

const handleLogout = async () => {
   try {
      await $api('/api/admin/logout', { method: 'POST' })
      isAdmin.value = false
      if (route.path === '/admin') {
         router.push('/')
      }
   } catch { }
}

const isExternalLink = (href: string) => href.startsWith('http')

const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }

watch(isSidebarOpen, (isOpen) => { if (mobileSidebarInstance) isOpen ? mobileSidebarInstance.show() : mobileSidebarInstance.hide() })

onMounted(() => {
   checkAdminStatus()
   if (mobileSidebarRef.value && process.client) {
      mobileSidebarInstance = new Offcanvas(mobileSidebarRef.value, { backdrop: false, keyboard: true })
      mobileSidebarRef.value.addEventListener('hidden.bs.offcanvas', () => { isSidebarOpen.value = false })
   }
})

onUnmounted(() => {
   if (mobileSidebarRef.value) mobileSidebarRef.value.removeEventListener('hidden.bs.offcanvas', () => { })
})
</script>

<style scoped>
.navbar {
   transition: background-color 0.3s;
   background-color: var(--dark-card-bg);
   border-bottom: 1px solid var(--app-border-color);
}

body.light-mode .navbar {
   background-color: var(--light-card-bg);
}

.scrolled-nav {
   background-color: var(--dark-card-bg);
   border-bottom: 1px solid var(--app-border-color);
}

body.light-mode .scrolled-nav {
   background-color: var(--light-card-bg);
}

@media (max-width:767.98px) {
   .navbar {
      transition: background-color 0.3s;
      background: transparent;
      border-bottom: none
   }

   .scrolled-nav {
      background-color: rgba(30, 30, 30, 0.7);
      border-bottom: 1px solid var(--app-border-color);
      backdrop-filter: blur(10px);
   }

   body.light-mode .scrolled-nav {
      background-color: rgba(255, 255, 255, 0.7);
   }
}

.main-title {
   font-family: "Stack Sans Notch", sans-serif;
   font-weight: 700;
   font-size: 1.25rem;
   color: var(--app-text-color);
}

.text-primary-color {
   color: var(--app-text-color);
}

.nav-link.custom-link {
   font-size: 0.9rem;
   font-weight: 500;
   color: var(--app-secondary-text-color);
   padding: 0 0.3rem !important;
   transition: color 0.2s;
   position: relative;
   background: transparent !important;
   border: none !important;
}

.nav-link.custom-link:hover {
   color: var(--app-text-color);
}

.nav-link.custom-link.active {
   color: var(--app-accent-color) !important;
   font-weight: 600;
}

.full-sidebar {
   background-color: var(--app-card-bg);
   border-right: 1px solid var(--app-border-color);
   width: 260px !important;
}

.sidebar-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   border-bottom: 1px solid var(--app-border-color);
   padding: 0.25rem 0.5rem 1.25rem 0.5rem;
}

.sidebar-header .main-title {
   font-size: 1.1rem;
}

.sidebar-desc {
   font-size: 0.8rem;
   color: var(--app-secondary-text-color);
}

.btn-close-custom {
   background: transparent;
   border: none;
   color: var(--app-secondary-text-color);
   font-size: 1.2rem;
}

.sidebar-pill {
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0.75rem 1rem;
   border-radius: 8px;
   color: var(--app-secondary-text-color);
   font-weight: 500;
   font-size: 0.95rem;
   transition: all 0.2s ease;
}

.icon-box {
   width: 24px;
   display: inline-flex;
   justify-content: center;
   margin-right: 12px;
   font-size: 1.1rem;
}

.sidebar-pill:hover {
   background-color: var(--app-bg);
   color: var(--app-text-color);
}

.sidebar-pill.active {
   background-color: var(--app-accent-color);
   color: var(--app-accent-text-color) !important;
   font-weight: 600;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sidebar-pill.active .icon-box i {
   color: var(--app-accent-text-color) !important;
}

.shop-card {
   display: block;
   text-decoration: none;
   background-color: var(--app-bg);
   padding: 1.25rem;
   border-radius: 12px;
   border: 1px solid var(--app-border-color);
   transition: all 0.2s;
   position: relative;
   overflow: hidden;
}

.shop-title {
   color: var(--app-text-color);
}

.shop-desc {
   color: var(--app-secondary-text-color);
}

body.light-mode .shop-title {
   color: var(--light-text-color);
}

body.light-mode .shop-desc {
   color: var(--light-secondary-text-color);
}

.shop-card:hover {
   transform: translateY(-3px);
   border-color: var(--app-accent-color);
}

.faded-icon {
   position: absolute;
   right: -20px;
   bottom: -20px;
   font-size: 80px;
   color: var(--app-accent-color);
   opacity: 0.05;
   transform: rotate(-15deg);
   transition: opacity 0.3s;
}

.shop-card:hover .faded-icon {
   opacity: 0.1;
}

.shop-content {
   position: relative;
   z-index: 2;
}

.icon-circle {
   width: 30px;
   height: 30px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   background-color: var(--app-accent-color);
   color: var(--app-accent-text-color);
}

.sidebar-overlay {
   position: fixed;
   inset: 0;
   background: rgba(0, 0, 0, 0.6);
   backdrop-filter: blur(4px);
   z-index: 1040;
}

.fade-enter-active,
.fade-leave-active {
   transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
}

.page-content {
   min-height: 80vh;
}
</style>