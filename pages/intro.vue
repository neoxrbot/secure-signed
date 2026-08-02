<template>
   <div class="container px-3 mb-5">
      <div class="hero-header text-center mx-auto mb-5">
         <div class="status-badge d-inline-flex align-items-center gap-2 mb-3">
            <span class="status-dot"></span>
            <span>Edge Network Node v1.4</span>
         </div>

         <h1 class="hero-title text-color fw-bold mb-3">
            Developer Utility Engine
         </h1>

         <p class="hero-desc text-muted mb-4 mx-auto">
            High-throughput cloud utilities for batch file hosting, link shortening, and HMAC URL signing. Built for
            low-latency API integration.
         </p>

         <div class="d-flex align-items-center justify-content-center gap-3 flex-wrap">
            <button class="btn btn-custom-accent py-2 px-4 d-flex align-items-center gap-2" @click="navigateTo('/')">
               <i class="bi bi-cpu-fill"></i>
               <span>Launch Workstation</span>
            </button>
            <button class="btn btn-outline-secondary py-2 px-4 d-flex align-items-center gap-2"
               @click="navigateTo('/docs')">
               <i class="bi bi-terminal"></i>
               <span>API Documentation</span>
            </button>
         </div>
      </div>

      <div class="interactive-sandbox-card mb-5">
         <div
            class="sandbox-header p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
               <span class="tech-tag">REST API</span>
               <span class="text-muted fs-xs">Endpoint Playground</span>
            </div>
            <div class="lang-tabs d-flex align-items-center gap-1">
               <button v-for="lang in ['curl', 'javascript', 'python']" :key="lang" class="lang-tab-btn"
                  :class="{ 'active': activeLang === lang }" @click="switchLang(lang)">
                  {{ lang.toUpperCase() }}
               </button>
            </div>
         </div>

         <div class="sandbox-body p-3 p-md-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
               <span class="fs-xs text-muted font-monospace">POST /api/upload</span>
               <button class="btn-copy-code" @click="copyCode">
                  <i :class="copyStatus === 'Copied!' ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"></i>
                  <span>{{ copyStatus }}</span>
               </button>
            </div>
            <pre class="code-preview-block font-monospace fs-xs mb-0"><code>{{ codeExamples[activeLang] }}</code></pre>
         </div>
      </div>

      <div class="spec-grid-card mb-5">
         <div class="p-3 border-bottom">
            <h6 class="mb-0 fw-bold text-color fs-sm">Platform Specifications</h6>
         </div>
         <div class="row g-0">
            <div class="col-md-6 border-end border-bottom">
               <div class="spec-box p-4">
                  <div class="spec-icon mb-3"><i class="bi bi-cloud-arrow-up"></i></div>
                  <h6 class="fw-bold text-color mb-1 fs-sm">Batch File Engine</h6>
                  <p class="fs-xs text-muted mb-0">
                     Supports up to 10 concurrent file uploads with client-side progress tracking and instant CDN URL
                     generation.
                  </p>
               </div>
            </div>
            <div class="col-md-6 border-bottom">
               <div class="spec-box p-4">
                  <div class="spec-icon mb-3"><i class="bi bi-link-45deg"></i></div>
                  <h6 class="fw-bold text-color mb-1 fs-sm">URL Shortener</h6>
                  <p class="fs-xs text-muted mb-0">
                     Fast 301 redirection engine with automatic hit analytics and custom short key generation.
                  </p>
               </div>
            </div>
            <div class="col-md-6 border-end">
               <div class="spec-box p-4">
                  <div class="spec-icon mb-3"><i class="bi bi-shield-check"></i></div>
                  <h6 class="fw-bold text-color mb-1 fs-sm">HMAC Asset Signing</h6>
                  <p class="fs-xs text-muted mb-0">
                     Tokenized CDN proxy links with customizable headers, filename overrides, and expiration timestamps.
                  </p>
               </div>
            </div>
            <div class="col-md-6">
               <div class="spec-box p-4">
                  <div class="spec-icon mb-3"><i class="bi bi-hdd-network"></i></div>
                  <h6 class="fw-bold text-color mb-1 fs-sm">Edge Runtime</h6>
                  <p class="fs-xs text-muted mb-0">
                     Deployed on Cloudflare Workers edge nodes ensuring minimal latency and global availability.
                  </p>
               </div>
            </div>
         </div>
      </div>

      <div class="ready-cta-card p-4 p-md-5 text-center">
         <h5 class="fw-bold text-color mb-2">Ready to Integrate?</h5>
         <p class="fs-xs text-muted mb-4 max-w-500 mx-auto">Start utilizing cloud tools directly from the workstation or
            inspect our REST API specs.</p>
         <div class="d-flex align-items-center justify-content-center gap-3 flex-wrap">
            <button class="btn btn-custom-accent py-2 px-4" @click="navigateTo('/')">Open Workstation</button>
            <button class="btn btn-outline-secondary py-2 px-4" @click="navigateTo('/docs')">Read API Docs</button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHead, useRouter } from '#app'

useHead({
   title: 'Introduce - Developer Utility Engine'
})

const router = useRouter()
const activeLang = ref('curl')
const copyStatus = ref('Copy Code')

const codeExamples: Record<string, string> = {
   curl: `curl -X POST "https://api.domain.com/api/upload" \\\n  -F "files=@file1.jpg" \\\n  -F "files=@file2.pdf"`,
   javascript: `const formData = new FormData()\nformData.append('files', fileInput.files[0])\n\nconst response = await fetch('/api/upload', {\n  method: 'POST',\n  body: formData\n})\nconst result = await response.json()`,
   python: `import requests\n\nfiles = [('files', open('document.pdf', 'rb'))]\nresponse = requests.post('https://api.domain.com/api/upload', files=files)\nprint(response.json())`
}

const playClickSound = () => {
   try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
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

const switchLang = (lang: string) => {
   playClickSound()
   activeLang.value = lang
}

const copyCode = async () => {
   playClickSound()
   try {
      await navigator.clipboard.writeText(codeExamples[activeLang.value])
      copyStatus.value = 'Copied!'
      setTimeout(() => { copyStatus.value = 'Copy Code' }, 2000)
   } catch { }
}

const navigateTo = (path: string) => {
   playClickSound()
   router.push(path)
}
</script>

<style scoped>
.fs-xs {
   font-size: 0.75rem;
}

.fs-sm {
   font-size: 0.875rem;
}

.max-w-500 {
   max-width: 500px;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.border-bottom,
.border-end {
   border-color: var(--app-border-color) !important;
}

.hero-header {
   max-width: 680px;
}

.status-badge {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   padding: 0.3rem 0.75rem;
   border-radius: 2rem;
   font-size: 0.725rem;
   font-weight: 600;
   color: var(--app-text-color);
}

.status-dot {
   width: 7px;
   height: 7px;
   border-radius: 50%;
   background-color: #198754;
   box-shadow: 0 0 6px #198754;
}

.hero-title {
   font-size: 2.25rem;
   line-height: 1.2;
   letter-spacing: -0.02em;
}

@media (max-width: 768px) {
   .hero-title {
      font-size: 1.75rem;
   }
}

.hero-desc {
   font-size: 0.925rem;
   line-height: 1.6;
}

.interactive-sandbox-card,
.spec-grid-card,
.ready-cta-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.625rem;
   overflow: hidden;
}

.tech-tag {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   color: var(--app-accent-color);
   font-size: 0.675rem;
   font-weight: 700;
   padding: 0.2rem 0.5rem;
   border-radius: 0.25rem;
}

.lang-tabs {
   background-color: var(--app-bg);
   padding: 3px;
   border-radius: 0.375rem;
   border: 1px solid var(--app-border-color);
}

.lang-tab-btn {
   border: none;
   background: transparent;
   color: var(--app-secondary-text-color);
   font-size: 0.7rem;
   font-weight: 700;
   padding: 0.2rem 0.6rem;
   border-radius: 0.25rem;
   transition: all 0.2s ease;
}

.lang-tab-btn.active {
   background-color: var(--app-accent-color);
   color: var(--app-accent-text-color);
}

.code-preview-block {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   padding: 1rem;
   border-radius: 0.375rem;
   color: var(--app-text-color);
   line-height: 1.6;
   overflow-x: auto;
}

.btn-copy-code {
   border: none;
   background: transparent;
   color: var(--app-secondary-text-color);
   font-size: 0.75rem;
   display: flex;
   align-items: center;
   gap: 0.35rem;
   transition: color 0.2s;
}

.btn-copy-code:hover {
   color: var(--app-text-color);
}

.spec-box {
   height: 100%;
   background-color: var(--app-card-bg);
   transition: background-color 0.2s ease;
}

.spec-box:hover {
   background-color: var(--app-bg);
}

.spec-icon {
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
</style>