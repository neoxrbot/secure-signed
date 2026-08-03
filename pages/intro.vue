<template>
   <div class="container px-3 mb-5">
      <div class="hero-header mx-auto mb-5">
         <div class="hero-status d-flex align-items-center gap-2 mb-4">
            <span class="status-dot"></span>
            <span class="status-text font-monospace">node:online</span>
            <span class="status-sep">/</span>
            <span class="status-text font-monospace">edge-network v1.4</span>
         </div>

         <div class="hero-prompt mb-2">
            <span class="prompt-glyph">$</span>
            <span class="prompt-cmd">init developer-utility-engine</span>
            <span class="prompt-cursor"></span>
         </div>

         <h1 class="hero-title fw-bold mb-3">
            Developer<br />Utility Engine
         </h1>

         <p class="hero-desc mb-4">
            High-throughput cloud utilities for batch file hosting, link shortening, and HMAC URL
            signing. Built for low-latency API integration.
         </p>

         <div class="d-flex align-items-center gap-3 flex-wrap hero-actions">
            <button class="btn-bracket btn-bracket-solid d-flex align-items-center gap-2" @click="navigateTo('/')">
               <i class="bi bi-cpu-fill"></i>
               <span>Launch Workstation</span>
            </button>
            <button class="btn-bracket d-flex align-items-center gap-2" @click="navigateTo('/docs')">
               <i class="bi bi-terminal"></i>
               <span>API Documentation</span>
            </button>
         </div>
      </div>

      <div class="interactive-sandbox-card mb-5">
         <div class="sandbox-header p-3">
            <div class="sandbox-header-row d-flex align-items-center justify-content-between flex-wrap gap-2">
               <div class="d-flex align-items-center gap-2">
                  <span class="term-chrome">
                     <span class="term-dot"></span>
                     <span class="term-dot"></span>
                     <span class="term-dot"></span>
                  </span>
                  <span class="tech-tag">REST API</span>
                  <span class="term-path font-monospace">/ endpoint playground</span>
               </div>
               <div class="lang-tabs d-flex align-items-center gap-1">
                  <button v-for="lang in ['curl', 'javascript', 'python']" :key="lang" class="lang-tab-btn"
                     :class="{ 'active': activeLang === lang }" @click="switchLang(lang)">
                     {{ lang.toUpperCase() }}
                  </button>
               </div>
            </div>
         </div>

         <div class="sandbox-body p-3 p-md-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
               <span class="req-line font-monospace">POST /api/upload</span>
               <button class="btn-copy-code" @click="copyCode">
                  <i :class="copyStatus === 'Copied!' ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"></i>
                  <span>{{ copyStatus }}</span>
               </button>
            </div>
            <pre class="code-preview-block font-monospace mb-0"><code>{{ codeExamples[activeLang] }}</code></pre>
         </div>
      </div>

      <div class="spec-grid-card mb-5">
         <div class="spec-grid-header p-3 d-flex align-items-center justify-content-between">
            <h6 class="mb-0 fw-bold spec-heading">Platform Specifications</h6>
            <span class="spec-count font-monospace">{{ specs.length }} modules</span>
         </div>
         <div class="row g-0">
            <div class="col-md-6 spec-cell" v-for="(spec, i) in specs" :key="spec.title">
               <div class="spec-box p-4">
                  <div class="d-flex align-items-start justify-content-between mb-3">
                     <div class="spec-icon"><i :class="spec.icon"></i></div>
                     <span class="spec-index font-monospace">{{ String(i).padStart(2, '0') }}</span>
                  </div>
                  <h6 class="fw-bold spec-title mb-1">{{ spec.title }}</h6>
                  <p class="spec-desc mb-0">{{ spec.desc }}</p>
               </div>
            </div>
         </div>
      </div>

      <div class="ready-cta-card p-4 p-md-5 text-center">
         <h5 class="fw-bold cta-title mb-2">Ready to Integrate?</h5>
         <p class="cta-desc mb-4 max-w-500 mx-auto">Start utilizing cloud tools directly from the workstation or
            inspect our REST API specs.</p>
         <div class="d-flex align-items-center justify-content-center gap-3 flex-wrap">
            <button class="btn-bracket btn-bracket-solid" @click="navigateTo('/')">Open Workstation</button>
            <button class="btn-bracket" @click="navigateTo('/docs')">Read API Docs</button>
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

const specs = [
   {
      icon: 'bi bi-cloud-arrow-up',
      title: 'Batch File Engine',
      desc: 'Supports up to 10 concurrent file uploads with client-side progress tracking and instant CDN URL generation.'
   },
   {
      icon: 'bi bi-link-45deg',
      title: 'URL Shortener',
      desc: 'Fast 301 redirection engine with automatic hit analytics and custom short key generation.'
   },
   {
      icon: 'bi bi-shield-check',
      title: 'HMAC Asset Signing',
      desc: 'Tokenized CDN proxy links with customizable headers, filename overrides, and expiration timestamps.'
   },
   {
      icon: 'bi bi-hdd-network',
      title: 'Edge Runtime',
      desc: 'Deployed on Cloudflare Workers edge nodes ensuring minimal latency and global availability.'
   }
]

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
/* ---------------------------------------------------------------
   Local type roles (colors always inherited from style.css vars)
   Display : 'Stack Sans Notch'  -> headings, signature terminal bits
   Body    : inherited global 'Space Grotesk'
   Utility : font-monospace (bootstrap monospace stack) -> code/data
------------------------------------------------------------------ */

.max-w-500 {
   max-width: 500px;
}

.hero-header {
   max-width: 640px;
}

/* -- status readout ------------------------------------------------ */
.hero-status {
   font-size: 0.7rem;
   letter-spacing: 0.04em;
   text-transform: uppercase;
   color: var(--app-secondary-text-color);
}

.status-dot {
   width: 6px;
   height: 6px;
   border-radius: 50%;
   background-color: #198754;
   box-shadow: 0 0 6px #198754;
   flex-shrink: 0;
}

.status-sep {
   opacity: .4;
}

/* -- terminal prompt line ------------------------------------------ */
.hero-prompt {
   font-family: 'Stack Sans Notch', monospace;
   font-size: 0.85rem;
   font-weight: 500;
   color: var(--app-secondary-text-color);
   display: flex;
   align-items: center;
   gap: 0.5rem;
}

.prompt-glyph {
   color: var(--app-accent-color);
   font-weight: 700;
}

.prompt-cursor {
   display: inline-block;
   width: 7px;
   height: 1rem;
   background-color: var(--app-accent-color);
   animation: blink 1.1s steps(1) infinite;
}

@media (prefers-reduced-motion: reduce) {
   .prompt-cursor {
      animation: none;
   }
}

@keyframes blink {
   0%, 49% { opacity: 1; }
   50%, 100% { opacity: 0; }
}

/* -- hero title ------------------------------------------------------ */
.hero-title {
   font-family: 'Stack Sans Notch', sans-serif;
   font-size: 2.75rem;
   line-height: 1.05;
   letter-spacing: -0.03em;
   color: var(--app-text-color);
}

@media (max-width: 768px) {
   .hero-title {
      font-size: 2rem;
   }
}

.hero-desc {
   font-size: 0.925rem;
   line-height: 1.6;
   color: var(--app-secondary-text-color);
   max-width: 480px;
}

/* -- bracket buttons: CLI-flag styled actions ----------------------- */
.btn-bracket {
   position: relative;
   background: transparent;
   border: 1px solid var(--app-border-color);
   color: var(--app-text-color);
   font-family: 'Stack Sans Notch', sans-serif;
   font-weight: 600;
   font-size: 0.875rem;
   padding: 0.6rem 1.25rem;
   border-radius: 0.25rem;
   transition: border-color .2s, background-color .2s, color .2s;
}

.btn-bracket:hover {
   border-color: var(--app-accent-color);
   color: var(--app-accent-color);
}

.btn-bracket-solid {
   background-color: var(--app-accent-color);
   color: var(--app-accent-text-color);
   border-color: var(--app-accent-color);
}

.btn-bracket-solid:hover {
   background-color: transparent;
   color: var(--app-accent-color);
}

/* -- shared surfaces -------------------------------------------------- */
.interactive-sandbox-card,
.spec-grid-card,
.ready-cta-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.5rem;
   overflow: hidden;
}

/* -- sandbox / terminal chrome ---------------------------------------- */
.sandbox-header {
   border-bottom: 1px solid var(--app-border-color);
}

.term-chrome {
   display: inline-flex;
   gap: 4px;
   margin-right: 0.35rem;
}

.term-dot {
   width: 7px;
   height: 7px;
   border-radius: 50%;
   background-color: var(--app-border-color);
}

.term-path {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color);
}

.tech-tag {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   color: var(--app-accent-color);
   font-family: 'Stack Sans Notch', sans-serif;
   font-size: 0.675rem;
   font-weight: 700;
   letter-spacing: 0.03em;
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

.req-line {
   font-size: 0.75rem;
   color: var(--app-secondary-text-color);
}

.code-preview-block {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   padding: 1rem;
   border-radius: 0.375rem;
   color: var(--app-text-color);
   font-size: 0.75rem;
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

/* -- spec sheet (datasheet-style, indices are real spec numbers) ----- */
.spec-grid-header {
   border-bottom: 1px solid var(--app-border-color);
}

.spec-heading {
   font-family: 'Stack Sans Notch', sans-serif;
   font-size: 0.875rem;
   color: var(--app-text-color);
}

.spec-count {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color);
}

.spec-cell {
   border-color: var(--app-border-color) !important;
}

.spec-cell:nth-child(odd) {
   border-right: 1px solid var(--app-border-color);
}

.spec-cell:nth-child(-n+2) {
   border-bottom: 1px solid var(--app-border-color);
}

@media (max-width: 767px) {
   .spec-cell {
      border-right: none !important;
      border-bottom: 1px solid var(--app-border-color);
   }
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

.spec-index {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color);
   opacity: .7;
}

.spec-title {
   font-family: 'Stack Sans Notch', sans-serif;
   font-size: 0.875rem;
   color: var(--app-text-color);
}

.spec-desc {
   font-size: 0.75rem;
   color: var(--app-secondary-text-color);
   line-height: 1.55;
}

/* -- closing CTA -------------------------------------------------------- */
.cta-title {
   font-family: 'Stack Sans Notch', sans-serif;
   color: var(--app-text-color);
}

.cta-desc {
   font-size: 0.75rem;
   color: var(--app-secondary-text-color);
}
</style>