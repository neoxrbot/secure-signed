export default defineNuxtPlugin(() => {
   if (process.server) return

   //    const ua = navigator.userAgent
   //    const isIOS = /iPad|iPhone|iPod/.test(ua)
   //    const isAndroid = /Android/.test(ua)

   //    if (isIOS || isAndroid) return

   //    const threshold = 160

   //    setInterval(() => {
   //       const devtoolsOpen =
   //          window.outerWidth - window.innerWidth > threshold ||
   //          window.outerHeight - window.innerHeight > threshold

   //       if (devtoolsOpen) {
   //          document.body.innerHTML = ''
   //          window.location.href = 'https://www.youtube.com/watch?v=w8jSAzR58MQ'
   //       }
   //    }, 1000)
})