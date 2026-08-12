export default defineNuxtPlugin(() => {
   if (process.server) return

   // const audio = new Audio('https://www.myinstants.com/media/sounds/chicken-on-tree-screaming.mp3')
   // audio.volume = 0.7

   // const isMobile = (() => {
   //    if (window.matchMedia('(pointer: coarse)').matches) return true
   //    if (navigator.maxTouchPoints > 1) return true
   //    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
   // })()

   // const triggerAlert = () => {
   //    audio.currentTime = 0
   //    audio.play().catch(() => { })

   //    if (navigator.vibrate) {
   //       navigator.vibrate([200, 100, 200, 100, 400])
   //    }
   // }

   // document.addEventListener('keydown', (e) => {

   //    if (e.key === 'F12') {
   //       e.preventDefault()
   //       triggerAlert()
   //    }

   //    if (
   //       e.ctrlKey &&
   //       e.shiftKey &&
   //       ['I', 'J', 'C'].includes(e.key)
   //    ) {
   //       e.preventDefault()
   //       triggerAlert()
   //    }

   //    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
   //       e.preventDefault()
   //       triggerAlert()
   //    }
   // })

   // document.addEventListener('contextmenu', (e) => {
   //    if (!isMobile) {
   //       e.preventDefault()
   //       triggerAlert()
   //    }
   // })
})