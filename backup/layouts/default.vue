<template>
   <div>
      <nav class="navbar fixed-top py-3 transition-all" :class="{ 'scrolled-nav': isScrolled }">
         <div class="container px-3">
            <NuxtLink to="/" class="navbar-brand main-title mb-0 d-flex align-items-center gap-2">
               <i class="bi bi-shield-lock-fill text-primary"></i> Securly Sign
            </NuxtLink>

            <div class="d-flex align-items-center gap-3">
               <div class="d-none d-md-flex align-items-center">
                  <ul class="navbar-nav flex-row gap-2">
                     <li v-for="link in navLinks" :key="link.text" class="nav-item">
                        <NuxtLink class="nav-link custom-link" :to="link.href" active-class="active">
                           {{ link.text }}
                        </NuxtLink>
                     </li>
                  </ul>
               </div>
               <button class="btn btn-sm btn-outline-secondary" @click="toggleTheme">
                  <i :class="theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon'"></i>
               </button>
               <button class="navbar-toggler d-md-none border-0 p-0" type="button" @click="toggleSidebar">
                  <i class="bi bi-three-dots fs-1 text-primary-color"></i>
               </button>
            </div>
         </div>
      </nav>

      <!-- Mobile Sidebar -->
      <Transition name="fade">
         <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
      </Transition>

      <div ref="mobileSidebarRef" class="offcanvas offcanvas-start full-sidebar" tabindex="-1">
         <div class="offcanvas-body d-flex flex-column p-3">
            <div class="sidebar-header">
               <h5 class="main-title mb-0">Securly Sign</h5>
               <button type="button" class="btn-close-custom" @click="closeSidebar">
                  <i class="bi bi-x-lg"></i>
               </button>
            </div>

            <ul class="nav flex-column gap-2 mt-4">
               <li v-for="link in navLinks" :key="link.text" class="nav-item">
                  <NuxtLink class="nav-link sidebar-pill" :to="link.href" active-class="active" @click="closeSidebar">
                     <div class="d-flex align-items-center">
                        <span class="icon-box"><i :class="link.icon"></i></span>
                        {{ link.text }}
                     </div>
                  </NuxtLink>
               </li>
            </ul>
         </div>
      </div>

      <!-- Page Content -->
      <div class="page-content">
         <slot />
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { usePageEffects } from '~/composables/usePageEffects'

const { isScrolled, theme, toggleTheme } = usePageEffects()

const mobileSidebarRef = ref(null)
let mobileSidebarInstance = null
const isSidebarOpen = ref(false)

const navLinks = ref([
   { text: 'Home', href: '/', icon: 'bi bi-house' },
   { text: 'Documentation', href: '/docs', icon: 'bi bi-book' }
])

const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }

watch(isSidebarOpen, (isOpen) => {
   if (mobileSidebarInstance) {
      isOpen ? mobileSidebarInstance.show() : mobileSidebarInstance.hide()
   }
})

onMounted(async () => {
   if (process.client && mobileSidebarRef.value) {
      // Import bootstrap JS secara dinamis hanya di client
      const { Offcanvas } = await import('bootstrap')
      mobileSidebarInstance = new Offcanvas(mobileSidebarRef.value, { backdrop: false, keyboard: true })
      mobileSidebarRef.value.addEventListener('hidden.bs.offcanvas', () => { isSidebarOpen.value = false })
   }
})
</script>