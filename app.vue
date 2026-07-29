<template>
   <div>
      <audio ref="bgAudio" src="https://zlyvo.pages.dev/file/CQACAgUAAxkDAAIUB2pBzwABkGBzYGXwhwWYLe1WEk1vggACHyAAAt6cEFbNLkjG6qjWSjwE" loop playsinline preload="auto" />

      <div class="container">
         <div class="theme-switch-container">
            <button class="theme-toggle-btn" aria-label="Toggle Theme" @click="toggleTheme">
               <i class="bi bi-moon-stars moon-icon" />
               <i class="bi bi-sun sun-icon" />
            </button>
         </div>

         <header>
            <h1>Secure CDN Proxy</h1>
            <p class="subtitle">Generate encrypted secure download links with headers proxy</p>
         </header>

         <form @submit.prevent="generateLink">
            <div class="input-area spaced">
               <input v-model="url" type="url" placeholder="Enter target download URL..." required>
            </div>
            <div class="input-area spaced">
               <input v-model="filename" type="text" placeholder="Filename e.g. image.jpg (Optional)">
            </div>
            <div class="input-area">
               <textarea v-model="headers" placeholder='Custom Headers JSON (Optional)&#10;e.g. {"Authorization": "Bearer token"}' />
            </div>
            <button type="submit" class="btn" :disabled="isGenerating">
               {{ isGenerating ? 'Generating...' : 'Generate Secure Link' }}
            </button>
         </form>

         <div v-if="error" class="error">{{ error }}</div>

         <div v-if="result" id="result">
            <span class="success-title">
               <i class="bi bi-check2-circle" />
               Link Generated Successfully!
            </span>
            <div class="result-item"><strong>Expires :</strong> <span>{{ expiresAt }}</span></div>
            <div class="result-item"><strong>Secure Link :</strong></div>
            <div class="result-link-container">
               <a :href="result.download_url" target="_blank">{{ result.download_url }}</a>
               <button type="button" class="copy-btn" :class="{ copied }" @click="copyLink">
                  {{ copied ? 'Copied!' : 'Copy' }}
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
const url = ref('')
const filename = ref('')
const headers = ref('')
const result = ref(null)
const error = ref('')
const isGenerating = ref(false)
const copied = ref(false)
const bgAudio = ref(null)

const expiresAt = computed(() => {
   if (!result.value?.expires_at) return '-'
   const expiryDate = new Date(result.value.expires_at)
   return `${expiryDate.toLocaleTimeString()} (${expiryDate.toLocaleDateString()})`
})

function applySavedTheme() {
   const savedTheme = localStorage.getItem('theme')
   const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
   document.body.classList.toggle('dark', savedTheme === 'dark' || (!savedTheme && systemPrefersDark))
}

function playAudio() {
   bgAudio.value?.play().then(() => {
      document.removeEventListener('click', playAudio)
      document.removeEventListener('touchstart', playAudio)
      document.removeEventListener('dragover', playAudio)
   }).catch(() => {})
}

function toggleTheme() {
   document.body.classList.toggle('dark')
   const isDark = document.body.classList.contains('dark')
   localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

async function generateLink() {
   result.value = null
   error.value = ''

   let parsedHeaders = {}
   if (headers.value.trim()) {
      try {
         parsedHeaders = JSON.parse(headers.value.trim())
      } catch {
         error.value = 'Invalid JSON in Headers field'
         return
      }
   }

   isGenerating.value = true

   try {
      const json = await $fetch('/api/generate', {
         method: 'POST',
         body: {
            url: url.value,
            filename: filename.value.trim() || null,
            headers: parsedHeaders
         }
      })

      if (json.status) {
         result.value = json.data
         url.value = ''
         filename.value = ''
         headers.value = ''
      } else {
         error.value = json.error || 'Generation failed'
      }
   } catch {
      error.value = 'An error occurred during process'
   } finally {
      isGenerating.value = false
   }
}

async function copyLink() {
   if (!result.value?.download_url) return
   await navigator.clipboard.writeText(result.value.download_url)
   copied.value = true
   setTimeout(() => {
      copied.value = false
   }, 1500)
}

onMounted(() => {
   applySavedTheme()
   playAudio()
   document.addEventListener('click', playAudio)
   document.addEventListener('touchstart', playAudio)
   document.addEventListener('dragover', playAudio)
})
</script>

<style>
:root {
   --bg-body: #fafafa;
   --bg-card: #ffffff;
   --text-main: #111111;
   --text-muted: #666666;
   --border: #e5e5e5;
   --primary: #111111;
   --primary-hover: #222222;
   --primary-text: #ffffff;
   --generate-bg: #fafafa;
   --generate-hover: #f4f4f5;
   --result-bg: #fafafa;
   --result-border: #e5e5e5;
   --copy-btn-bg: #f4f4f5;
   --copy-btn-text: #111111;
   --copy-btn-hover: #e5e5e5;
   --success: #10b981;
   --error: #ef4444;
   --error-bg: rgba(239, 68, 68, 0.08);
   --pattern-color: rgba(17, 17, 17, 0.04);
}

body.dark {
   --bg-body: #09090b;
   --bg-card: #18181b;
   --text-main: #f4f4f5;
   --text-muted: #a1a1aa;
   --border: #27272a;
   --primary: #fafafa;
   --primary-hover: #e4e4e7;
   --primary-text: #09090b;
   --generate-bg: #18181b;
   --generate-hover: #27272a;
   --result-bg: #09090b;
   --result-border: #27272a;
   --copy-btn-bg: #27272a;
   --copy-btn-text: #fafafa;
   --copy-btn-hover: #3f3f46;
   --success: #34d399;
   --error: #f87171;
   --error-bg: rgba(248, 113, 113, 0.08);
   --pattern-color: rgba(250, 250, 250, 0.03);
}

* {
   box-sizing: border-box;
   margin: 0;
   padding: 0;
   transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

html,
body,
#__nuxt {
   overflow: hidden;
   height: 100vh;
   width: 100vw;
   margin: 0;
}

body {
   font-family: "Space Grotesk", sans-serif;
   background-color: var(--bg-body);
   background-image: radial-gradient(var(--pattern-color) 1.5px, transparent 1.5px);
   background-size: 24px 24px;
   color: var(--text-main);
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 1.5rem;
}

.container {
   background-color: var(--bg-card);
   padding: 2.5rem 2rem;
   border: 1px solid var(--border);
   border-radius: 12px;
   width: 100%;
   max-width: 440px;
   text-align: center;
   position: relative;
   z-index: 10;
}

.theme-switch-container {
   position: absolute;
   top: 1.25rem;
   right: 1.25rem;
   z-index: 20;
}

.theme-toggle-btn {
   background: transparent;
   border: 1px solid var(--border);
   cursor: pointer;
   color: var(--text-muted);
   padding: 0.5rem;
   border-radius: 6px;
   display: flex;
   align-items: center;
   justify-content: center;
}

.theme-toggle-btn:hover:not(:disabled) {
   background-color: var(--generate-hover);
   color: var(--text-main);
   border-color: var(--text-muted);
}

.theme-toggle-btn i {
   font-size: 18px;
   display: block;
   line-height: 1;
}

.theme-toggle-btn .sun-icon,
body.dark .theme-toggle-btn .moon-icon {
   display: none;
}

.theme-toggle-btn .moon-icon,
body.dark .theme-toggle-btn .sun-icon {
   display: block;
}

header {
   margin-bottom: 1.5rem;
   padding-top: 0.5rem;
}

h1 {
   color: var(--text-main);
   font-size: 1.6rem;
   font-weight: 700;
   margin-bottom: 0.4rem;
   letter-spacing: -0.03em;
}

.subtitle {
   color: var(--text-muted);
   font-size: 0.85rem;
   font-weight: 400;
}

.input-area {
   position: relative;
   width: 100%;
}

.spaced {
   margin-bottom: 1rem;
}

.input-area input,
.input-area textarea {
   width: 100%;
   background-color: var(--generate-bg);
   border: 1.5px solid var(--border);
   border-radius: 8px;
   padding: 1rem 1.25rem;
   font-family: "Space Grotesk", sans-serif;
   font-size: 0.9rem;
   font-weight: 500;
   color: var(--text-main);
   outline: none;
   transition: border-color 0.15s ease, background-color 0.15s ease;
}

.input-area textarea {
   resize: none;
   height: 80px;
}

.input-area input:focus,
.input-area textarea:focus {
   border-color: var(--text-main);
   background-color: var(--generate-hover);
}

.input-area input::placeholder,
.input-area textarea::placeholder {
   color: var(--text-muted);
}

.btn {
   font-family: "Space Grotesk", sans-serif;
   background-color: var(--primary);
   color: var(--primary-text);
   border: 1px solid var(--border);
   padding: 0.8rem 1.5rem;
   border-radius: 6px;
   font-weight: 600;
   font-size: 0.95rem;
   cursor: pointer;
   margin-top: 1.25rem;
   width: 100%;
   transition: background-color 0.15s, transform 0.1s;
}

.btn:hover:not(:disabled) {
   background-color: var(--primary-hover);
}

.btn:active:not(:disabled) {
   transform: scale(0.99);
}

.btn:disabled {
   background-color: var(--generate-bg);
   border-color: var(--border);
   color: var(--text-muted);
   cursor: not-allowed;
}

.error {
   color: var(--error);
   background-color: var(--error-bg);
   border: 1px solid var(--error);
   padding: 0.75rem 1rem;
   border-radius: 6px;
   margin-top: 1.25rem;
   font-size: 0.85rem;
   font-weight: 500;
   animation: fadeIn 0.2s ease;
}

#result {
   margin-top: 1.5rem;
   text-align: left;
   background-color: var(--result-bg);
   border: 1px solid var(--result-border);
   padding: 1.25rem;
   border-radius: 8px;
   animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
   from {
      opacity: 0;
      transform: translateY(8px);
   }

   to {
      opacity: 1;
      transform: translateY(0);
   }
}

.success-title {
   color: var(--success);
   font-weight: 700;
   font-size: 0.95rem;
   margin-bottom: 0.75rem;
   display: flex;
   align-items: center;
   gap: 6px;
}

.result-item {
   font-size: 0.85rem;
   margin-bottom: 0.5rem;
   color: var(--text-muted);
}

.result-item strong {
   color: var(--text-main);
}

.result-link-container {
   display: flex;
   gap: 8px;
   margin-top: 0.5rem;
}

.result-link-container a {
   flex: 1;
   background-color: var(--bg-card);
   border: 1px solid var(--border);
   padding: 0.5rem;
   border-radius: 6px;
   color: var(--primary);
   text-decoration: none;
   font-weight: 500;
   font-size: 0.8rem;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
}

.copy-btn {
   background-color: var(--copy-btn-bg);
   color: var(--copy-btn-text);
   border: 1px solid var(--border);
   padding: 0.5rem 0.75rem;
   border-radius: 6px;
   font-size: 0.8rem;
   font-weight: 600;
   font-family: inherit;
   cursor: pointer;
}

.copy-btn:hover {
   background-color: var(--copy-btn-hover);
   border-color: var(--text-muted);
}

.copy-btn.copied {
   background: #d1fae5;
   color: #065f46;
   border-color: #10b981;
}

body.dark .copy-btn.copied {
   background: #064e3b;
   color: #34d399;
   border-color: #059669;
}
</style>