// composables/usePageEffects.js
import { ref, onMounted } from 'vue'

const theme = ref('dark')
const isScrolled = ref(false)

export function usePageEffects() {
   const applyTheme = (newTheme) => {
      if (typeof document === 'undefined') return
      if (newTheme === 'dark') {
         document.body.classList.remove('light-mode')
      } else {
         document.body.classList.add('light-mode')
      }
      localStorage.setItem('theme', newTheme)
      theme.value = newTheme
   }

   const toggleTheme = () => {
      applyTheme(theme.value === 'dark' ? 'light' : 'dark')
   }

   onMounted(() => {
      const savedTheme = localStorage.getItem('theme')
      const initialTheme = savedTheme === 'dark' ? 'dark' : 'light'
      applyTheme(initialTheme)

      const handleScroll = () => {
         isScrolled.value = window.scrollY > 10
      }

      window.addEventListener('scroll', handleScroll)
      handleScroll()
   })

   return {
      theme,
      isScrolled,
      toggleTheme
   }
}