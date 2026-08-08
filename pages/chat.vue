<template>
   <div class="container px-3 mb-5">
      <div class="chat-container-card shadow-sm">
         <div class="chat-header p-3 border-bottom d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-3">
               <div class="bot-avatar-box">
                  <i class="bi bi-robot"></i>
                  <span class="online-indicator"></span>
               </div>
               <div>
                  <h6 class="mb-0 fw-bold text-color">Assistant Bot</h6>
                  <span class="fs-xs text-muted">Online &middot; Edge AI Node</span>
               </div>
            </div>
            <button class="btn btn-sm btn-outline-secondary btn-icon-only" @click="clearChat" title="Clear Chat">
               <i class="bi bi-trash3"></i>
            </button>
         </div>

         <div ref="chatScrollContainer" class="chat-messages-area">
            <div v-if="!messages.length" class="empty-chat-state text-center py-5">
               <div class="empty-bot-icon mb-3">
                  <i class="bi bi-chat-dots-fill"></i>
               </div>
               <h6 class="fw-bold text-color mb-1">Start a Conversation</h6>
               <p class="fs-xs text-muted mb-0">Ask questions, request code snippets, or share photos with captions.</p>
            </div>

            <div v-for="(msg, idx) in messages" :key="idx" class="chat-bubble-wrapper" :class="msg.role">
               <div class="chat-bubble">
                  <div v-if="msg.image" class="bubble-media mb-2">
                     <img :src="msg.image" class="img-fluid rounded-2 cursor-pointer"
                        @click="openLightbox(msg.image)" />
                  </div>
                  <div class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
                  <div class="chat-meta">
                     <span>{{ msg.time }}</span>
                     <i v-if="msg.role === 'user'" class="bi bi-check2-all text-primary ms-1"></i>
                  </div>
               </div>
            </div>

            <div v-if="isTyping" class="chat-bubble-wrapper bot">
               <div class="chat-bubble typing-bubble">
                  <div class="typing-dots">
                     <span></span>
                     <span></span>
                     <span></span>
                  </div>
               </div>
            </div>
         </div>

         <div v-if="selectedPhoto" class="photo-preview-bar">
            <div class="position-relative d-inline-block">
               <img :src="photoPreview" class="photo-preview-thumb" />
               <button class="btn-remove-photo" @click="removeSelectedPhoto">
                  <i class="bi bi-x"></i>
               </button>
            </div>
            <div class="flex-grow-1 min-w-0">
               <input v-model="photoCaption" type="text" class="form-control form-control-sm caption-input"
                  placeholder="Add a caption..." @keydown.enter.prevent="sendMessage" />
            </div>
         </div>

         <div class="chat-input-toolbar p-3 border-top">
            <form @submit.prevent="sendMessage" class="d-flex align-items-center gap-2">
               <button type="button" class="btn btn-outline-secondary btn-attach" @click="photoInput?.click()"
                  :disabled="loading" title="Attach Photo">
                  <i class="bi bi-image"></i>
               </button>
               <input ref="photoInput" type="file" class="d-none" accept="image/*" @change="onPhotoSelected" />

               <textarea v-model="inputText" class="form-control chat-textarea" rows="1" placeholder="Type a message..."
                  @keydown.enter.exact.prevent="sendMessage" :disabled="loading"></textarea>

               <button type="submit" class="btn btn-custom-accent btn-send"
                  :disabled="loading || (!inputText.trim() && !selectedPhoto)">
                  <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-send-fill"></i>
               </button>
            </form>
         </div>
      </div>

      <Transition name="fade">
         <div v-if="lightbox.isOpen" class="lightbox-overlay" @click.self="closeLightbox">
            <button class="btn-close-lightbox" @click="closeLightbox">
               <i class="bi bi-x-lg"></i>
            </button>
            <div class="lightbox-content" @click.self="closeLightbox">
               <img :src="lightbox.currentImage" class="img-original-ratio rounded-3" />
            </div>
         </div>
      </Transition>
   </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, reactive, onMounted } from 'vue'
import { useNuxtApp, useHead } from '#app'
import MarkdownIt from '@/utils/markdown-it'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

useHead({ title: 'AI Assistant Chat' })

const { $api } = useNuxtApp()

const md = new MarkdownIt({ html: true, linkify: true, breaks: true })

const messages = ref([])
const inputText = ref('')
const selectedPhoto = ref(null)
const photoPreview = ref('')
const photoCaption = ref('')
const loading = ref(false)
const isTyping = ref(false)
const photoInput = ref(null)
const chatScrollContainer = ref(null)

const lightbox = reactive({
   isOpen: false,
   currentImage: ''
})

const getCurrentTime = () => {
   const now = new Date()
   return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const openLightbox = (url) => {
   lightbox.currentImage = url
   lightbox.isOpen = true
   if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
   lightbox.isOpen = false
   if (typeof document !== 'undefined') document.body.style.overflow = ''
}

const renderMarkdown = (content) => {
   if (!content) return ''
   let text = content.replace(/[\u2010-\u2015\u2212]/g, '-')
   text = text.replace(/(?:\r?\n|^)\s*---+\s*(?=\r?\n|$)/g, '\n\n---\n\n')
   return md.render(text)
}

const scrollToBottom = async () => {
   await nextTick()
   if (chatScrollContainer.value) {
      chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight
   }
}

const initPlyrAndPrism = async () => {
   await nextTick()
   if (typeof window !== 'undefined') {
      Prism.highlightAll()
      const videos = document.querySelectorAll('.markdown-body video')
      videos.forEach(v => {
         if (!v.classList.contains('plyr-initialized')) {
            v.classList.add('plyr-initialized')
            new Plyr(v, { ratio: '16:9', controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'] })
         }
      })
      const audios = document.querySelectorAll('.markdown-body audio')
      audios.forEach(a => {
         if (!a.classList.contains('plyr-initialized')) {
            a.classList.add('plyr-initialized')
            new Plyr(a, { controls: ['play', 'progress', 'current-time', 'mute', 'volume'] })
         }
      })
   }
}

watch(messages, () => {
   scrollToBottom()
   initPlyrAndPrism()
}, { deep: true })

const onPhotoSelected = (e) => {
   const file = e.target.files?.[0]
   if (!file) return
   selectedPhoto.value = file
   photoPreview.value = URL.createObjectURL(file)
}

const removeSelectedPhoto = () => {
   selectedPhoto.value = null
   photoPreview.value = ''
   photoCaption.value = ''
   if (photoInput.value) photoInput.value.value = ''
}

const clearChat = () => {
   messages.value = []
}

const sendMessage = async () => {
   const text = inputText.value.trim()
   const caption = photoCaption.value.trim()
   const hasPhoto = !!selectedPhoto.value

   if (!text && !hasPhoto) return

   loading.value = true
   let uploadedImageUrl = ''

   try {
      if (hasPhoto) {
         const fd = new FormData()
         fd.append('file', selectedPhoto.value)
         const uploadRes = await $fetch('/api/upload', { method: 'POST', body: fd })
         uploadedImageUrl = uploadRes?.data?.url ? uploadRes.data.url.replace(/^https?:\/\/[^\/]+/, '') : ''
      }

      const userMsgContent = caption || text
      messages.value.push({
         role: 'user',
         content: userMsgContent,
         image: uploadedImageUrl,
         time: getCurrentTime()
      })

      inputText.value = ''
      removeSelectedPhoto()
      isTyping.value = true
      await scrollToBottom()

      const chatRes = await $api('/api/chat', {
         method: 'POST',
         body: {
            message: userMsgContent,
            image: uploadedImageUrl
         }
      }).catch(() => null)

      isTyping.value = false

      if (chatRes && chatRes.data) {
         messages.value.push({
            role: 'bot',
            content: chatRes.data.message || chatRes.data,
            image: chatRes.data.image || '',
            time: getCurrentTime()
         })
      } else {
         messages.value.push({
            role: 'bot',
            content: `Terima kasih! Pesan kamu telah diterima.\n\nJika kamu butuh bantuan lebih lanjut, silakan tanyakan kepada kami.`,
            time: getCurrentTime()
         })
      }
   } catch (e) {
      isTyping.value = false
      messages.value.push({
         role: 'bot',
         content: 'Maaf, terjadi kendala koneksi. Silakan coba lagi nanti.',
         time: getCurrentTime()
      })
   } finally {
      loading.value = false
      await scrollToBottom()
   }
}

onMounted(() => {
   messages.value.push({
      role: 'bot',
      content: 'Halo! Saya Assistant Bot. Ada yang bisa saya bantu hari ini?',
      time: getCurrentTime()
   })
})
</script>

<style scoped>
.fs-xs {
   font-size: 0.75rem;
}

.text-color {
   color: var(--app-text-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.chat-container-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.75rem;
   overflow: hidden;
   height: 75vh;
   min-height: 520px;
   display: flex;
   flex-direction: column;
}

.bot-avatar-box {
   position: relative;
   width: 40px;
   height: 40px;
   border-radius: 50%;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.25rem;
   color: var(--app-accent-color);
}

.online-indicator {
   position: absolute;
   bottom: 2px;
   right: 2px;
   width: 10px;
   height: 10px;
   border-radius: 50%;
   background-color: #198754;
   border: 2px solid var(--app-card-bg);
}

.btn-icon-only {
   width: 32px;
   height: 32px;
   padding: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 0.375rem;
}

.chat-messages-area {
   flex: 1;
   overflow-y: auto;
   padding: 1.25rem;
   background-color: var(--app-bg);
   display: flex;
   flex-direction: column;
   gap: 1rem;
}

.empty-bot-icon {
   width: 56px;
   height: 56px;
   margin: 0 auto;
   border-radius: 50%;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.6rem;
   color: var(--app-accent-color);
}

.chat-bubble-wrapper {
   display: flex;
   flex-direction: column;
   max-width: 80%;
}

.chat-bubble-wrapper.user {
   align-self: flex-end;
   align-items: flex-end;
}

.chat-bubble-wrapper.bot {
   align-self: flex-start;
   align-items: flex-start;
}

.chat-bubble {
   position: relative;
   padding: 0.65rem 0.85rem;
   border-radius: 0.75rem;
   font-size: 0.9rem;
   word-break: break-word;
   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.chat-bubble-wrapper.user .chat-bubble {
   background-color: var(--app-accent-color);
   color: var(--app-accent-text-color, #ffffff);
   border-bottom-right-radius: 0.2rem;
}

.chat-bubble-wrapper.user .chat-bubble :deep(.markdown-body) {
   color: var(--app-accent-text-color, #ffffff) !important;
}

.chat-bubble-wrapper.bot .chat-bubble {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   color: var(--app-text-color);
   border-bottom-left-radius: 0.2rem;
}

.bubble-media img {
   max-width: 100%;
   max-height: 260px;
   object-fit: cover;
   border-radius: 0.5rem;
}

.chat-meta {
   display: flex;
   align-items: center;
   gap: 0.2rem;
   font-size: 0.65rem;
   margin-top: 0.25rem;
   opacity: 0.75;
   justify-content: flex-end;
}

.photo-preview-bar {
   background-color: var(--app-bg);
   border-top: 1px solid var(--app-border-color);
   padding: 0.65rem 1rem;
   display: flex;
   align-items: center;
   gap: 0.75rem;
}

.photo-preview-thumb {
   width: 48px;
   height: 48px;
   border-radius: 0.375rem;
   object-fit: cover;
   border: 1px solid var(--app-border-color);
}

.btn-remove-photo {
   position: absolute;
   top: -6px;
   right: -6px;
   width: 20px;
   height: 20px;
   border-radius: 50%;
   background: #dc3545;
   color: #fff;
   border: none;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 0.8rem;
   cursor: pointer;
}

.caption-input {
   background-color: var(--app-card-bg) !important;
   border-color: var(--app-border-color) !important;
   color: var(--app-text-color) !important;
}

.chat-input-toolbar {
   background-color: var(--app-card-bg);
}

.btn-attach {
   width: 38px;
   height: 38px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   flex-shrink: 0;
}

.chat-textarea {
   background-color: var(--app-bg) !important;
   border-color: var(--app-border-color) !important;
   color: var(--app-text-color) !important;
   border-radius: 1.25rem;
   padding: 0.5rem 1rem;
   resize: none;
}

.btn-send {
   width: 38px;
   height: 38px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   flex-shrink: 0;
   padding: 0;
}

.typing-bubble {
   padding: 0.6rem 1rem;
}

.typing-dots {
   display: flex;
   align-items: center;
   gap: 4px;
}

.typing-dots span {
   width: 6px;
   height: 6px;
   border-radius: 50%;
   background-color: var(--app-secondary-text-color);
   animation: typingBounce 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) {
   animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
   animation-delay: -0.16s;
}

@keyframes typingBounce {

   0%,
   80%,
   100% {
      transform: scale(0);
   }

   40% {
      transform: scale(1);
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
}

.markdown-body {
   color: inherit;
   line-height: 1.5;
   font-size: 0.9rem;
}

.markdown-body :deep(p) {
   margin-top: 0 !important;
   margin-bottom: 0.35rem !important;
}

.markdown-body :deep(p:last-child) {
   margin-bottom: 0 !important;
}

.markdown-body :deep(img) {
   max-width: 100%;
   border-radius: 0.5rem;
}

.markdown-body :deep(.plyr) {
   border-radius: 0.5rem;
   overflow: hidden;
   margin-top: 0.4rem;
   margin-bottom: 0.4rem;
}
</style>