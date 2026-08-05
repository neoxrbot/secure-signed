<template>
   <div class="container px-3 mb-4">
      <div class="panel-hero mx-auto mb-5">
         <span class="plate-eyebrow d-block text-center mb-2">Edge Network Node &middot; v1.4</span>
         <h1 class="plate-title text-center fw-bold mb-3">Developer Utility Engine</h1>
         <p class="panel-desc text-center mx-auto mb-4">
            High-throughput cloud utilities for batch file hosting, link shortening, and HMAC URL
            signing. Built for low-latency API integration.
         </p>

         <div class="btn-row d-flex align-items-center justify-content-center gap-3">
            <button class="panel-btn panel-btn-solid d-flex align-items-center gap-2" @click="navigateTo('/service')">
               <i class="bi bi-cpu-fill"></i>
               <span>Services</span>
            </button>
            <button class="panel-btn d-flex align-items-center gap-2" @click="navigateTo('/docs')">
               <i class="bi bi-book"></i>
               <span>Documentation</span>
            </button>
         </div>
      </div>

      <div class="signal-card mb-5">
         <div class="signal-header p-3 d-flex align-items-center justify-content-between">
            <h6 class="signal-heading mb-0 fw-bold">Signal Path</h6>
            <span class="signal-count font-monospace">{{ specs.length }} modules</span>
         </div>
         <div class="row g-0">
            <div class="col-md-6 signal-cell" v-for="(spec, i) in specs" :key="spec.title">
               <div class="signal-box p-4">
                  <div class="d-flex align-items-start justify-content-between mb-3">
                     <div class="signal-icon"><i :class="spec.icon"></i></div>
                     <span class="signal-index font-monospace">{{ String(i + 1).padStart(2, '0') }}</span>
                  </div>
                  <h6 class="signal-title fw-bold mb-1">{{ spec.title }}</h6>
                  <p class="signal-desc mb-0">{{ spec.desc }}</p>
               </div>
            </div>
         </div>
      </div>

      <div class="ready-panel p-4 p-md-5 text-center">
         <span class="plate-eyebrow d-block mb-2">Status: Ready</span>
         <h5 class="fw-bold plate-title-sm mb-2">Ready to Integrate?</h5>
         <p class="panel-desc mb-4 max-w-500 mx-auto">Start utilizing cloud tools directly from the workstation or
            inspect our REST API specs.</p>
         <div class="d-flex align-items-center justify-content-center gap-3 flex-wrap">
            <button class="panel-btn panel-btn-solid" @click="navigateTo('/service')">Open Service</button>
            <button class="panel-btn" @click="navigateTo('/docs')">Read API Docs</button>
         </div>
      </div>
   </div>
</template>

<script setup>
import { useRouter } from '#app'

const router = useRouter()

const specs = [
   {
      icon: 'bi bi-cloud-arrow-up',
      title: 'Batch File Engine',
      desc: 'Up to 10 concurrent uploads with client-side progress tracking and instant CDN URL generation.'
   },
   {
      icon: 'bi bi-shield-check',
      title: 'HMAC Asset Signing',
      desc: 'Tokenized CDN proxy links with custom headers, filename overrides, and expiration timestamps.'
   },
   {
      icon: 'bi bi-link-45deg',
      title: 'URL Shortener',
      desc: 'Fast 301 redirection engine with automatic hit analytics and custom short key generation.'
   },
   {
      icon: 'bi bi-hdd-network',
      title: 'Edge Runtime',
      desc: 'Deployed on Cloudflare Workers edge nodes ensuring minimal latency and global availability.'
   }
]

const playClickSound = () => {
   try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.035)
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.035)
   } catch { }
}

const navigateTo = (path) => {
   playClickSound()
   router.push(path)
}
</script>

<style scoped>
.max-w-500 {
   max-width: 500px;
}

.panel-hero {
   max-width: 660px;
   animation: fadeInUp 0.5s ease backwards;
}

.plate-eyebrow {
   font-family: 'Stack Sans Notch', sans-serif;
   font-size: 0.7rem;
   font-weight: 600;
   letter-spacing: 0.18em;
   text-transform: uppercase;
   color: var(--app-secondary-text-color);
}

.plate-title {
   font-family: 'Stack Sans Notch', sans-serif;
   font-size: 2.25rem;
   font-weight: 700;
   letter-spacing: 0.02em;
   text-transform: uppercase;
   color: var(--app-text-color);
   text-shadow: 0 1px 0 rgba(var(--app-text-rgb), 0.08);
}

.plate-title-sm {
   font-family: 'Stack Sans Notch', sans-serif;
   letter-spacing: 0.03em;
   text-transform: uppercase;
   color: var(--app-text-color);
   font-size: 1.1rem;
}

@media (max-width: 768px) {
   .plate-title {
      font-size: 1.6rem;
   }
}

.panel-desc {
   font-size: 0.925rem;
   line-height: 1.6;
   max-width: 480px;
   color: var(--app-secondary-text-color);
}

.panel-btn {
   background: transparent;
   border: 1px solid var(--app-border-color);
   color: var(--app-text-color);
   font-family: 'Stack Sans Notch', sans-serif;
   font-weight: 600;
   font-size: 0.85rem;
   letter-spacing: 0.02em;
   padding: 0.6rem 1.3rem;
   border-radius: 0.3rem;
   transition: color .2s, background-color .2s;
}

.panel-btn:hover {
   border-color: var(--app-border-color);
   color: var(--app-accent-color);
}

.panel-btn-solid {
   background-color: var(--app-accent-color);
   color: var(--app-accent-text-color);
   border-color: var(--app-accent-color);
}

.panel-btn-solid:hover {
   background-color: var(--app-accent-color);
   opacity: 0.9;
   border-color: var(--app-accent-color);
   color: var(--app-accent-text-color);
}

.signal-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.5rem;
   overflow: hidden;
   animation: fadeInUp 0.5s ease 0.15s backwards;
}

.signal-header {
   border-bottom: 1px solid var(--app-border-color);
}

.signal-heading {
   font-family: 'Stack Sans Notch', sans-serif;
   font-size: 0.875rem;
   letter-spacing: 0.02em;
   color: var(--app-text-color);
}

.signal-count {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color);
}

.signal-cell:nth-child(odd) {
   border-right: 1px solid var(--app-border-color);
}

.signal-cell:nth-child(-n+2) {
   border-bottom: 1px solid var(--app-border-color);
}

@media (max-width: 767px) {
   .signal-cell {
      border-right: none !important;
      border-bottom: 1px solid var(--app-border-color);
   }
}

.signal-box {
   height: 100%;
   background-color: var(--app-card-bg);
   transition: background-color 0.2s ease;
}

.signal-box:hover {
   background-color: var(--app-bg);
}

.signal-icon {
   width: 36px;
   height: 36px;
   border-radius: 0.375rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
   font-size: 1.1rem;
}

.signal-index {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color);
   opacity: .7;
}

.signal-title {
   font-family: 'Stack Sans Notch', sans-serif;
   font-size: 0.875rem;
   color: var(--app-text-color);
}

.signal-desc {
   font-size: 0.75rem;
   line-height: 1.55;
   color: var(--app-secondary-text-color);
}

.ready-panel {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.5rem;
   animation: fadeInUp 0.5s ease 0.3s backwards;
}

@keyframes fadeInUp {
   from {
      opacity: 0;
      transform: translateY(16px);
   }

   to {
      opacity: 1;
      transform: translateY(0);
   }
}
</style>