<template>
   <div class="container px-3 mb-5">
      <div class="reader-max-width mx-auto">
         <div class="note-reader-card">
            <div v-if="pending" class="p-3 p-md-4">
               <div class="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                  <div class="skeleton-btn"></div>
                  <div class="skeleton-pill"></div>
                  <div class="skeleton-btn"></div>
               </div>
               <div class="skeleton-title mb-2" style="width: 80%;"></div>
               <div class="skeleton-title mb-3" style="width: 50%;"></div>
               <div class="skeleton-meta mb-3"></div>
               <div class="d-flex flex-column gap-2 mb-3">
                  <div class="skeleton-line" style="width: 100%;"></div>
                  <div class="skeleton-line" style="width: 90%;"></div>
                  <div class="skeleton-line" style="width: 95%;"></div>
                  <div class="skeleton-line" style="width: 70%;"></div>
               </div>
               <div class="skeleton-image mb-3"></div>
            </div>

            <div v-else-if="error" class="p-4 p-md-5 text-center">
               <div class="error-icon-circle mb-3">
                  <i class="bi bi-exclamation-octagon"></i>
               </div>
               <h6 class="fw-bold text-color mb-1">Unable to Load Note</h6>
               <p class="fs-xs text-muted mb-3">{{ error }}</p>
               <button class="btn btn-sm btn-custom-accent px-3" @click="goBack">
                  Return
               </button>
            </div>

            <article v-else>
               <div class="card-header-bar p-3 border-bottom d-flex align-items-center justify-content-between gap-2">
                  <button class="btn btn-sm btn-outline-secondary btn-action-pill" @click="goBack" title="Back">
                     <i class="bi bi-arrow-left"></i>
                     <span class="d-none d-sm-inline ms-1">Back</span>
                  </button>

                  <div class="d-flex align-items-center">
                     <span v-if="note.is_private" class="pill-badge private">
                        <i class="bi bi-lock-fill me-1"></i>Private
                     </span>
                     <span v-else class="pill-badge public">
                        <i class="bi bi-globe me-1"></i>Public
                     </span>
                  </div>

                  <button class="btn btn-sm btn-outline-secondary btn-action-pill" @click="copyShareLink"
                     title="Share Note">
                     <i :class="copyStatus === 'Copied!' ? 'bi bi-check-lg text-success' : 'bi bi-share'"></i>
                     <span class="d-none d-sm-inline ms-1">{{ copyStatus }}</span>
                  </button>
               </div>

               <div class="p-3 p-md-4">
                  <h1 class="article-title mb-2 text-color">{{ note.title }}</h1>

                  <div class="d-flex align-items-center gap-2 fs-xs text-muted flex-wrap mb-3 pb-3 border-bottom">
                     <span><i class="bi bi-eye me-1 opacity-75"></i>{{ note.reads || 0 }} reads</span>
                     <span>•</span>
                     <span><i class="bi bi-clock me-1 opacity-75"></i>{{ readingTime }} min read</span>
                     <span>•</span>
                     <span><i class="bi bi-calendar3 me-1 opacity-75"></i>{{ formatDate(note.created_at) }}</span>
                  </div>

                  <div v-if="getTagsList(note.tags).length" class="d-flex gap-2 flex-wrap mb-3">
                     <NuxtLink v-for="tag in getTagsList(note.tags)" :key="tag" :to="`/tag/${tag}`"
                        class="tag-badge text-decoration-none">
                        #{{ tag }}
                     </NuxtLink>
                  </div>

                  <div class="markdown-body" v-html="html"></div>
               </div>
            </article>
         </div>
      </div>

      <Transition name="fade">
         <div v-if="lightbox.isOpen" class="lightbox-overlay" @click.self="closeLightbox">
            <button class="btn-close-lightbox" @click="closeLightbox">
               <i class="bi bi-x-lg"></i>
            </button>
            <button v-if="hasMultipleImages" class="nav-btn prev" @click="prevImage">
               <i class="bi bi-chevron-left"></i>
            </button>
            <div class="lightbox-content" @click.self="closeLightbox">
               <img :src="lightbox.currentImage" class="img-original-ratio rounded-3" @contextmenu.prevent>
            </div>
            <button v-if="hasMultipleImages" class="nav-btn next" @click="nextImage">
               <i class="bi bi-chevron-right"></i>
            </button>
            <div class="lightbox-counter text-white fw-bold">
               {{ currentIndex + 1 }} / {{ lightbox.images.length }}
            </div>
         </div>
      </Transition>
   </div>
</template>

<script setup>
import MarkdownIt from '@/utils/markdown-it'
import { computed, onMounted, onUnmounted, ref, watch, nextTick, reactive } from 'vue'
import { useRoute, useRouter, useNuxtApp, useHead } from '#app'

import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-markup'

import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()

const note = ref({})
const pending = ref(true)
const error = ref('')
const copyStatus = ref('Share')

const md = new MarkdownIt({ html: true, linkify: true, breaks: true })

const lightbox = reactive({
   isOpen: false,
   currentImage: '',
   images: []
})

const currentIndex = computed(() => lightbox.images.indexOf(lightbox.currentImage))
const hasMultipleImages = computed(() => lightbox.images.length > 1)

const openLightbox = (url, allImgList = []) => {
   lightbox.currentImage = url
   lightbox.images = allImgList.length ? allImgList : [url]
   lightbox.isOpen = true
   if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
   lightbox.isOpen = false
   if (typeof document !== 'undefined') document.body.style.overflow = ''
}

const nextImage = () => {
   if (!lightbox.images.length) return
   const nextIdx = (currentIndex.value + 1) % lightbox.images.length
   lightbox.currentImage = lightbox.images[nextIdx]
}

const prevImage = () => {
   if (!lightbox.images.length) return
   const prevIdx = (currentIndex.value - 1 + lightbox.images.length) % lightbox.images.length
   lightbox.currentImage = lightbox.images[prevIdx]
}

const handleKeydown = (e) => {
   if (e.key === 'Escape') closeLightbox()
   if (lightbox.isOpen) {
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
   }
}

const getTagsList = (tags) => {
   if (Array.isArray(tags)) return tags
   if (typeof tags === 'string') return tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
   return []
}

const cleanContent = computed(() => {
   let text = note.value.content || ''
   text = text.replace(/[\u2010-\u2015\u2212]/g, '-')
   return text.replace(/(?:\r?\n|^)\s*---+\s*(?=\r?\n|$)/g, '\n\n---\n\n')
})

const html = computed(() => md.render(cleanContent.value))

const setupImageLightbox = async () => {
   await nextTick()
   if (typeof window === 'undefined') return
   const container = document.querySelector('.markdown-body')
   if (!container) return

   const imgs = Array.from(container.querySelectorAll('img'))
   const imgUrls = imgs.map(img => img.src).filter(Boolean)

   imgs.forEach(img => {
      if (!img.dataset.lightboxSetup) {
         img.dataset.lightboxSetup = 'true'
         img.style.cursor = 'pointer'
         img.addEventListener('click', () => {
            const gallery = img.closest('.gallery-grid')
            if (gallery) {
               const galleryImgs = Array.from(gallery.querySelectorAll('img')).map(i => i.src)
               openLightbox(img.src, galleryImgs)
            } else {
               openLightbox(img.src, imgUrls)
            }
         })
      }
   })
}

const initPlyr = async () => {
   await nextTick()
   if (typeof window !== 'undefined') {
      const videos = document.querySelectorAll('.markdown-body video')
      videos.forEach(v => {
         if (!v.classList.contains('plyr-initialized')) {
            v.classList.add('plyr-initialized')
            new Plyr(v, {
               ratio: '16:9',
               controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen']
            })
         }
      })
      const audios = document.querySelectorAll('.markdown-body audio')
      audios.forEach(a => {
         if (!a.classList.contains('plyr-initialized')) {
            a.classList.add('plyr-initialized')
            new Plyr(a, { controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'] })
         }
      })
   }
}

const setupCodeCopyButtons = async () => {
   await nextTick()
   if (typeof window === 'undefined') return
   const preBlocks = document.querySelectorAll('.markdown-body pre')

   preBlocks.forEach((pre) => {
      if (pre.querySelector('.btn-copy-code')) return

      pre.style.position = 'relative'

      const btn = document.createElement('button')
      btn.className = 'btn-copy-code'
      btn.type = 'button'
      btn.title = 'Copy Code'
      btn.innerHTML = '<i class="bi bi-clipboard"></i> <span>Copy</span>'

      btn.addEventListener('click', async () => {
         playClickSound()
         const code = pre.querySelector('code')?.innerText || pre.innerText
         try {
            await navigator.clipboard.writeText(code)
            btn.innerHTML = '<i class="bi bi-check-lg text-success"></i> <span class="text-success">Copied!</span>'
            setTimeout(() => {
               btn.innerHTML = '<i class="bi bi-clipboard"></i> <span>Copy</span>'
            }, 2000)
         } catch { }
      })

      pre.appendChild(btn)
   })
}

const highlightCode = async () => {
   await nextTick()
   if (typeof window !== 'undefined') {
      setTimeout(() => {
         Prism.highlightAll()
         setupCodeCopyButtons()
      }, 50)
   }
}

watch(html, async () => {
   await highlightCode()
   initPlyr()
   setupImageLightbox()
})

const readingTime = computed(() => {
   const words = (note.value.content || '').trim().split(/\s+/).length
   return Math.max(1, Math.ceil(words / 200))
})

useHead({
   title: computed(() => note.value.title ? `${note.value.title} - Note Reader` : 'Note Reader')
})

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

const goBack = () => {
   playClickSound()
   if (window.history.length > 1) {
      router.back()
   } else {
      router.push('/')
   }
}

const copyShareLink = async () => {
   playClickSound()
   try {
      await navigator.clipboard.writeText(window.location.href)
      copyStatus.value = 'Copied!'
      setTimeout(() => { copyStatus.value = 'Share' }, 2000)
   } catch { }
}

const formatDate = (v) => {
   if (!v) return '-'
   let val = typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : v
   if (typeof val === 'number' && val < 1e11) {
      val = val * 1000
   }
   const d = new Date(val)
   if (isNaN(d.getTime())) return '-'
   return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
   })
}

onMounted(async () => {
   if (typeof window !== 'undefined') window.addEventListener('keydown', handleKeydown)
   try {
      const r = await $api(`/api/notes/${route.params.id}`)
      note.value = r.data
      await highlightCode()
      initPlyr()
      setupImageLightbox()
   } catch (e) {
      error.value = e.data?.msg || 'Note not found or private'
   } finally {
      pending.value = false
   }
})

onUnmounted(() => {
   if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
@import '@/assets/css/markdown.css';
</style>

<style scoped>
.fs-xs {
   font-size: 0.725rem;
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

.reader-max-width {
   max-width: 780px;
}

.border-bottom {
   border-color: var(--app-border-color) !important;
}

.note-reader-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.625rem;
   overflow: hidden;
}

.card-header-bar {
   background-color: var(--app-bg);
}

.btn-action-pill {
   font-size: 0.75rem;
   padding: 0.25rem 0.6rem;
   border-radius: 0.375rem;
   display: inline-flex;
   align-items: center;
}

.article-title {
   font-size: 1.5rem;
   font-weight: 700;
   line-height: 1.3;
   letter-spacing: -0.01em;
}

.tag-badge {
   font-size: 0.725rem;
   padding: 0.2rem 0.55rem;
   border-radius: 0.25rem;
   background-color: var(--app-bg);
   color: var(--app-secondary-text-color);
   border: 1px solid var(--app-border-color);
   transition: color 0.2s ease, border-color 0.2s ease;
}

.tag-badge:hover {
   color: var(--app-accent-color);
   border-color: var(--app-border-color);
}

.pill-badge {
   display: inline-flex;
   align-items: center;
   font-size: 0.65rem;
   font-weight: 600;
   padding: 0.2rem 0.5rem;
   border-radius: 0.25rem;
}

.pill-badge.private {
   background-color: rgba(220, 53, 69, 0.15);
   color: #dc3545;
   border: 1px solid rgba(220, 53, 69, 0.25);
}

.pill-badge.public {
   background-color: rgba(25, 135, 84, 0.15);
   color: #198754;
   border: 1px solid rgba(25, 135, 84, 0.25);
}

.error-icon-circle {
   width: 46px;
   height: 46px;
   margin: 0 auto;
   border-radius: 50%;
   background-color: rgba(220, 53, 69, 0.1);
   border: 1px solid rgba(220, 53, 69, 0.2);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.3rem;
   color: #dc3545;
}

.skeleton-btn,
.skeleton-pill,
.skeleton-title,
.skeleton-meta,
.skeleton-line,
.skeleton-image {
   background: linear-gradient(90deg,
         var(--app-bg) 25%,
         var(--app-border-color) 50%,
         var(--app-bg) 75%);
   background-size: 200% 100%;
   animation: shimmer 1.5s infinite linear;
   border-radius: 0.375rem;
}

.skeleton-btn {
   width: 60px;
   height: 28px;
}

.skeleton-pill {
   width: 70px;
   height: 20px;
}

.skeleton-title {
   height: 24px;
}

.skeleton-meta {
   width: 160px;
   height: 14px;
}

.skeleton-line {
   height: 14px;
}

.skeleton-image {
   width: 100%;
   height: 180px;
   border-radius: 0.5rem;
}

@keyframes shimmer {
   0% {
      background-position: 200% 0;
   }

   100% {
      background-position: -200% 0;
   }
}

.lightbox-overlay {
   position: fixed;
   inset: 0;
   z-index: 9999;
   background-color: rgba(0, 0, 0, 0.88);
   backdrop-filter: blur(8px);
   display: flex;
   align-items: center;
   justify-content: center;
}

.btn-close-lightbox {
   position: absolute;
   top: 1.25rem;
   right: 1.25rem;
   background: rgba(255, 255, 255, 0.12);
   border: 1px solid rgba(255, 255, 255, 0.2);
   color: #fff;
   width: 40px;
   height: 40px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.1rem;
   cursor: pointer;
   z-index: 10000;
   transition: all 0.2s ease;
}

.btn-close-lightbox:hover {
   background: rgba(255, 255, 255, 0.25);
}

.nav-btn {
   position: absolute;
   top: 50%;
   transform: translateY(-50%);
   background: rgba(255, 255, 255, 0.12);
   border: 1px solid rgba(255, 255, 255, 0.2);
   color: #fff;
   width: 44px;
   height: 44px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.25rem;
   cursor: pointer;
   z-index: 10000;
   transition: all 0.2s ease;
}

.nav-btn.prev {
   left: 1.25rem;
}

.nav-btn.next {
   right: 1.25rem;
}

.nav-btn:hover {
   background: rgba(255, 255, 255, 0.25);
}

.lightbox-content {
   max-width: 90vw;
   max-height: 85vh;
   display: flex;
   align-items: center;
   justify-content: center;
}

.img-original-ratio {
   max-width: 100%;
   max-height: 85vh;
   object-fit: contain;
   box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.lightbox-counter {
   position: absolute;
   bottom: 1.25rem;
   left: 50%;
   transform: translateX(-50%);
   font-size: 0.85rem;
   background: rgba(0, 0, 0, 0.5);
   padding: 0.35rem 0.85rem;
   border-radius: 50px;
   border: 1px solid rgba(255, 255, 255, 0.15);
}

.fade-enter-active,
.fade-leave-active {
   transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
}
</style>