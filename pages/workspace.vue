<template>
   <div class="container px-3 mb-5">
      <div class="d-flex justify-content-between align-items-center mb-4 p-3 content-card">
         <div class="d-flex align-items-center gap-2">
            <div class="admin-icon-badge"><i class="bi bi-person-badge-fill"></i></div>
            <div>
               <h5 class="mb-0 fw-bold text-color">Admin Workspace</h5>
               <p class="text-muted mb-0 fs-xs">Create, edit, and publish notes</p>
            </div>
         </div>
         <button class="btn btn-outline-secondary d-flex align-items-center gap-1" @click="logout">
            <i class="bi bi-box-arrow-right"></i> Logout
         </button>
      </div>

      <div class="row g-4 align-items-start">
         <div class="col-lg-7">
            <div class="note-editor-card h-100 d-flex flex-column">
               <div class="p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div class="d-flex align-items-center gap-2">
                     <div class="editor-badge"><i class="bi bi-pencil-square"></i></div>
                     <div>
                        <h6 class="editor-title mb-0">{{ form.id ? 'Edit Note' : 'Create New Note' }}</h6>
                        <span class="editor-subtitle">{{ form.id ? 'Updating existing article' : 'Write content'
                           }}</span>
                     </div>
                  </div>
                  <button v-if="form.id" type="button" class="btn btn-xs btn-outline-secondary" @click="resetForm">
                     <i class="bi bi-x-circle me-1"></i> Cancel Edit
                  </button>
               </div>

               <div class="p-4 flex-grow-1">
                  <form @submit.prevent="saveNote">
                     <div class="mb-3">
                        <label class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Title</label>
                        <input v-model="form.title" class="form-control" placeholder="Enter note title..." required
                           :disabled="loading || isUploadingPhoto">
                     </div>

                     <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                           <label
                              class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted mb-0">Content</label>
                           <div class="toolbar d-flex align-items-center gap-1">
                              <button type="button" class="btn btn-xs btn-outline-secondary" @click="wrap('**', '**')"
                                 title="Bold" :disabled="loading || isUploadingPhoto || isPreview"><i
                                    class="bi bi-type-bold"></i></button>
                              <button type="button" class="btn btn-xs btn-outline-secondary" @click="wrap('_', '_')"
                                 title="Italic" :disabled="loading || isUploadingPhoto || isPreview"><i
                                    class="bi bi-type-italic"></i></button>
                              <button type="button" class="btn btn-xs btn-outline-secondary"
                                 @click="insertAtCursor('\n- ')" title="List"
                                 :disabled="loading || isUploadingPhoto || isPreview"><i
                                    class="bi bi-list-ul"></i></button>
                              <button type="button" class="btn btn-xs btn-outline-secondary" @click="wrap('`', '`')"
                                 title="Code" :disabled="loading || isUploadingPhoto || isPreview"><i
                                    class="bi bi-code"></i></button>

                              <button type="button" class="btn btn-xs btn-outline-secondary"
                                 @click="mediaInput?.click()" title="Upload Media (Image/Video/Audio)"
                                 :disabled="loading || isUploadingPhoto || isPreview"><i
                                    class="bi bi-film"></i></button>
                              <input ref="mediaInput" type="file" class="d-none" accept="image/*,video/*,audio/*"
                                 multiple @change="uploadMediaFiles" :disabled="isUploadingPhoto || isPreview">

                              <button type="button" class="btn btn-xs btn-outline-secondary" @click="fileInput?.click()"
                                 title="Attach File (All Extensions)"
                                 :disabled="loading || isUploadingPhoto || isPreview"><i
                                    class="bi bi-paperclip"></i></button>
                              <input ref="fileInput" type="file" class="d-none" accept="*/*" multiple
                                 @change="uploadAttachmentFiles" :disabled="isUploadingPhoto || isPreview">
                           </div>
                        </div>

                        <div class="textarea-wrapper position-relative">
                           <div v-if="isPreview" class="preview-box form-control overflow-auto">
                              <div v-if="previewHtml" class="markdown-body" v-html="previewHtml"></div>
                              <span v-else class="text-muted fs-xs italic">Nothing to preview...</span>
                           </div>
                           <textarea v-else ref="editor" v-model="form.content" class="form-control note-textarea"
                              rows="11" placeholder="Write content here..." required
                              :disabled="loading || isUploadingPhoto"></textarea>
                           <div v-if="isUploadingPhoto"
                              class="upload-overlay d-flex flex-column align-items-center justify-content-center">
                              <div class="spinner-border spinner-border-sm text-accent mb-2" role="status"></div>
                              <span class="fs-xs fw-semibold text-color">{{ uploadProgressText || 'Uploading...'
                                 }}</span>
                           </div>
                        </div>
                     </div>

                     <div class="d-flex align-items-center gap-4 mb-4">
                        <div class="form-check form-switch mb-0">
                           <input id="privateSwitch" v-model="form.is_private" class="form-check-input" type="checkbox"
                              :disabled="loading || isUploadingPhoto">
                           <label class="form-check-label fs-sm text-color fw-semibold"
                              for="privateSwitch">Private</label>
                        </div>
                        <div class="form-check form-switch mb-0">
                           <input id="previewSwitch" v-model="isPreview" class="form-check-input" type="checkbox"
                              :disabled="loading || isUploadingPhoto">
                           <label class="form-check-label fs-sm text-color fw-semibold"
                              for="previewSwitch">Preview</label>
                        </div>
                     </div>

                     <div class="d-flex gap-2">
                        <button
                           class="btn btn-custom-accent py-2 flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                           :disabled="loading || isUploadingPhoto">
                           <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                           <i v-else class="bi bi-check-circle-fill"></i>
                           <span>{{ form.id ? 'Update Article' : 'Publish Article' }}</span>
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>

         <div class="col-lg-5">
            <NotesManagement :notes="notes" :page="page" :per-page="perPage" :total-notes="totalNotes"
               :loading="loading" :active-edit-id="form.id" @edit="editNote" @delete="removeNote"
               @page-change="goToPage" @per-page-change="handlePerPageChange" @refresh="fetchNotes" />
         </div>
      </div>
      <Alert type="danger mt-3" :show="!!error">{{ error }}</Alert>
   </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useNuxtApp, useRouter, useState, useHead } from '#app'
import MarkdownIt from '@/utils/markdown-it'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

useHead({ title: 'Workspace' })

const { $api } = useNuxtApp()
const router = useRouter()
const isAdmin = useState('admin-status', () => false)

const loading = ref(false)
const isUploadingPhoto = ref(false)
const uploadProgressText = ref('')
const isPreview = ref(false)
const error = ref('')

const notes = ref([])
const page = ref(1)
const perPage = ref(5)
const totalNotes = ref(0)
const editor = ref(null)
const mediaInput = ref(null)
const fileInput = ref(null)
const form = ref({ id: '', title: '', content: '', is_private: true })

const md = new MarkdownIt({ html: true, linkify: true, breaks: true })

const previewHtml = computed(() => {
   let text = form.value.content || ''
   if (!text.trim()) return ''
   text = text.replace(/[\u2010-\u2015\u2212]/g, '-')
   text = text.replace(/(?:\r?\n|^)\s*---+\s*(?=\r?\n|$)/g, '\n\n---\n\n')
   return md.render(text)
})

const formatBytes = (bytes, decimals = 2) => {
   if (!bytes || bytes === 0) return '0 B'
   const k = 1024
   const dm = decimals < 0 ? 0 : decimals
   const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
   const i = Math.floor(Math.log(bytes) / Math.log(k))
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
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

watch([isPreview, previewHtml], async () => {
   if (isPreview.value) {
      await nextTick()
      if (typeof window !== 'undefined') {
         Prism.highlightAll()
         initPlyr()
      }
   }
})

const check = async () => {
   try {
      const r = await $api('/api/admin/me')
      if (!r?.data?.admin) {
         isAdmin.value = false
         router.replace('/login')
         return
      }
      isAdmin.value = true
      fetchNotes()
   } catch {
      isAdmin.value = false
      router.replace('/login')
   }
}

const logout = async () => {
   try {
      await $api('/api/admin/logout', { method: 'POST' })
   } catch { }
   isAdmin.value = false
   router.push('/login')
}

const fetchNotes = async () => {
   loading.value = true
   try {
      const r = await $api(`/api/notes?page=${page.value}&per_page=${perPage.value}`)
      notes.value = r.data || []
      totalNotes.value = r.meta?.total || notes.value.length
      page.value = r.meta?.page || page.value
   } finally {
      loading.value = false
   }
}

const goToPage = async (target) => {
   page.value = Math.max(1, target)
   await fetchNotes()
}

const handlePerPageChange = async (newPerPage) => {
   perPage.value = newPerPage
   page.value = 1
   await fetchNotes()
}

const saveNote = async () => {
   loading.value = true
   try {
      await $api(form.value.id ? `/api/notes/${form.value.id}` : '/api/notes', {
         method: form.value.id ? 'PUT' : 'POST',
         body: form.value
      })
      resetForm()
      goToPage(1)
   } finally {
      loading.value = false
   }
}

const editNote = (n) => {
   form.value = { id: n.id, title: n.title, content: n.content, is_private: !!n.is_private }
}

const removeNote = async (id) => {
   if (!confirm('Delete this note?')) return
   await $api(`/api/notes/${id}`, { method: 'DELETE' })
   if (notes.value.length === 1 && page.value > 1) page.value--
   fetchNotes()
}

const resetForm = () => {
   form.value = { id: '', title: '', content: '', is_private: true }
   isPreview.value = false
}

const insertAtCursor = (text) => {
   const el = editor.value
   if (!el) {
      form.value.content += text
      return
   }
   const start = el.selectionStart ?? form.value.content.length
   const end = el.selectionEnd ?? form.value.content.length
   const before = form.value.content.slice(0, start)
   const after = form.value.content.slice(end)
   form.value.content = before + text + after
   nextTick(() => {
      el.focus()
      const newPos = start + text.length
      el.setSelectionRange(newPos, newPos)
   })
}

const wrap = (a, b) => {
   const el = editor.value
   if (!el) return insertAtCursor(a + b)
   const s = el.selectionStart, e = el.selectionEnd
   form.value.content = form.value.content.slice(0, s) + a + form.value.content.slice(s, e) + b + form.value.content.slice(e)
   nextTick(() => {
      el.focus()
      el.setSelectionRange(s + a.length, e + a.length)
   })
}

const buildGalleryHtml = (images) => {
   const main = images[0]
   const side = images.slice(1, 5)
   const extra = images.length - 5

   let html = `\n<div class="product-grid-gallery">\n`
   html += `  <div class="grid-item item-main"><img src="${main.url}" alt="${main.name}"></div>\n`
   side.forEach((img, idx) => {
      const isLast = idx === side.length - 1 && extra > 0
      html += `  <div class="grid-item"><img src="${img.url}" alt="${img.name}">`
      if (isLast) {
         html += `<div class="more-overlay">+${extra} Foto</div>`
      }
      html += `</div>\n`
   })
   html += `</div>\n`
   return html
}

const uploadMediaFiles = async (ev) => {
   const files = Array.from(ev.target.files || [])
   if (!files.length) return
   isUploadingPhoto.value = true
   uploadProgressText.value = `Uploading (0/${files.length})...`

   try {
      const imageList = []
      for (let i = 0; i < files.length; i++) {
         const file = files[i]
         uploadProgressText.value = `Uploading (${i + 1}/${files.length})...`
         const fd = new FormData()
         fd.append('file', file)
         const r = await $fetch('/api/upload', { method: 'POST', body: fd })
         const relativeUrl = r.data.url.replace(/^https?:\/\/[^\/]+/, '')

         if (file.type.startsWith('image/')) {
            imageList.push({ name: file.name, url: relativeUrl })
         } else if (file.type.startsWith('video/')) {
            insertAtCursor(`\n<video controls class="plyr-video" src="${relativeUrl}"></video>\n`)
         } else if (file.type.startsWith('audio/')) {
            insertAtCursor(`\n<audio controls class="plyr-audio" src="${relativeUrl}"></audio>\n`)
         }
      }

      if (imageList.length > 0) {
         if (imageList.length === 1) {
            insertAtCursor(`\n![${imageList[0].name}](${imageList[0].url})\n`)
         } else {
            insertAtCursor(buildGalleryHtml(imageList))
         }
      }
   } catch (e) {
      error.value = e.message || 'Media upload failed'
   } finally {
      isUploadingPhoto.value = false
      uploadProgressText.value = ''
      if (mediaInput.value) mediaInput.value.value = ''
   }
}

const uploadAttachmentFiles = async (ev) => {
   const files = Array.from(ev.target.files || [])
   if (!files.length) return
   isUploadingPhoto.value = true
   uploadProgressText.value = `Uploading (0/${files.length})...`

   try {
      for (let i = 0; i < files.length; i++) {
         const file = files[i]
         uploadProgressText.value = `Uploading (${i + 1}/${files.length})...`
         const fd = new FormData()
         fd.append('file', file)
         const r = await $fetch('/api/upload', { method: 'POST', body: fd })
         const relativeUrl = r.data.url.replace(/^https?:\/\/[^\/]+/, '')
         const sizeStr = formatBytes(file.size)
         const tag = `\n<div class="file-download-box"><div class="file-info"><div class="file-icon"><i class="bi bi-file-earmark-arrow-down-fill"></i></div><div><div class="file-name">${file.name}</div><div class="file-size">${sizeStr}</div></div></div><a href="${relativeUrl}" download="${file.name}" class="btn-download"><i class="bi bi-download"></i> Download</a></div>\n`
         insertAtCursor(tag)
      }
   } catch (e) {
      error.value = e.message || 'File upload failed'
   } finally {
      isUploadingPhoto.value = false
      uploadProgressText.value = ''
      if (fileInput.value) fileInput.value.value = ''
   }
}

onMounted(check)
</script>

<style scoped>
.fs-xs {
   font-size: 0.75rem;
}

.fs-sm {
   font-size: 0.875rem;
}

.btn-xs {
   font-size: 0.75rem;
   padding: 0.2rem 0.5rem;
}

.tracking-wider {
   letter-spacing: 0.05em;
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

.border-bottom {
   border-color: var(--app-border-color) !important;
}

.content-card,
.note-editor-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.625rem;
   overflow: hidden;
}

.admin-icon-badge,
.editor-badge {
   width: 36px;
   height: 36px;
   border-radius: 0.375rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
}

.editor-title {
   font-weight: 700;
   color: var(--app-text-color);
   font-size: 0.95rem;
}

.editor-subtitle {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color) !important;
}

.note-textarea,
.preview-box {
   height: 278px;
   padding: 0.375rem 0.75rem !important;
}

.note-textarea {
   font-family: inherit;
   resize: vertical;
}

.textarea-wrapper {
   position: relative;
}

.preview-box {
   background-color: var(--app-bg);
   border-color: var(--app-border-color) !important;
   overflow-y: auto;
}

.upload-overlay {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background-color: rgba(28, 28, 30, 0.75);
   border-radius: 0.375rem;
   backdrop-filter: blur(2px);
   z-index: 10;
}

.markdown-body {
   color: var(--app-text-color);
   line-height: 1.5;
   font-size: 0.925rem;
}

.markdown-body :deep(p) {
   margin-top: 0 !important;
   margin-bottom: 0.35rem !important;
}

.markdown-body :deep(p:last-child) {
   margin-bottom: 0 !important;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
   color: var(--app-text-color);
   font-weight: 700;
   margin-top: 0.75rem !important;
   margin-bottom: 0.25rem !important;
   line-height: 1.3;
}

.markdown-body :deep(hr) {
   height: 1px;
   padding: 0;
   margin: 0.75rem 0 !important;
   background-color: var(--app-border-color);
   border: none;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
   padding-left: 1.25rem;
   margin-top: 0.25rem !important;
   margin-bottom: 0.35rem !important;
}

.markdown-body :deep(li) {
   margin-bottom: 0.15rem;
}

.markdown-body :deep(a) {
   color: var(--app-accent-color);
   text-decoration: underline;
   text-underline-offset: 3px;
}

.markdown-body :deep(code) {
   background-color: var(--app-bg);
   color: var(--app-accent-color);
   padding: 0.15rem 0.35rem;
   border-radius: 0.25rem;
   font-size: 0.85em;
   border: 1px solid var(--app-border-color);
}

.markdown-body :deep(pre) {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   padding: 0.75rem 1rem;
   border-radius: 0.5rem;
   overflow-x: auto;
   margin-top: 0.6rem;
   margin-bottom: 0.6rem;
}

.markdown-body :deep(pre code) {
   background: transparent;
   padding: 0;
   border: none;
   color: inherit;
}

.markdown-body :deep(pre[class*="language-"]) {
   background-color: var(--app-bg) !important;
   border: 1px solid var(--app-border-color) !important;
   border-radius: 0.5rem !important;
   margin-top: 0.6rem !important;
   margin-bottom: 0.6rem !important;
   padding: 0.75rem 1rem !important;
}

.markdown-body :deep(code[class*="language-"]) {
   text-shadow: none !important;
   font-family: 'Fira Code', Consolas, Monaco, monospace;
   font-size: 0.85em;
}

.markdown-body :deep(img) {
   max-width: 100%;
   height: auto;
   display: block;
   margin: 0.5rem auto !important;
   border-radius: 0.5rem;
   border: 1px solid var(--app-border-color);
}

.markdown-body :deep(p:has(img + img)) {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
   gap: 0.5rem;
   align-items: center;
   margin-top: 0.5rem !important;
   margin-bottom: 0.5rem !important;
}

.markdown-body :deep(p:has(img + img) img) {
   width: 100%;
   height: 100%;
   max-height: 280px;
   object-fit: cover;
   margin: 0 !important;
}

.markdown-body :deep(.product-grid-gallery) {
   display: grid;
   grid-template-columns: repeat(4, 1fr);
   grid-template-rows: repeat(2, 110px);
   gap: 6px;
   margin-top: 0.6rem;
   margin-bottom: 0.6rem;
   border-radius: 0.5rem;
   overflow: hidden;
}

.markdown-body :deep(.product-grid-gallery .grid-item) {
   position: relative;
   overflow: hidden;
   border-radius: 0.375rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
}

.markdown-body :deep(.product-grid-gallery .item-main) {
   grid-column: span 2;
   grid-row: span 2;
}

.markdown-body :deep(.product-grid-gallery .grid-item img) {
   width: 100% !important;
   height: 100% !important;
   object-fit: cover !important;
   margin: 0 !important;
   border: none !important;
   border-radius: 0 !important;
   display: block;
}

.markdown-body :deep(.product-grid-gallery .more-overlay) {
   position: absolute;
   inset: 0;
   background-color: rgba(0, 0, 0, 0.65);
   color: #ffffff;
   display: flex;
   align-items: center;
   justify-content: center;
   font-weight: 700;
   font-size: 0.85rem;
   backdrop-filter: blur(2px);
}

@media (max-width: 576px) {
   .markdown-body :deep(.product-grid-gallery) {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 100px);
   }
}

.markdown-body :deep(.file-download-box) {
   display: flex;
   align-items: center;
   justify-content: space-between;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.5rem;
   padding: 0.75rem 1rem;
   margin: 0.5rem 0;
   gap: 0.75rem;
   flex-wrap: wrap;
}

.markdown-body :deep(.file-download-box .file-info) {
   display: flex;
   align-items: center;
   gap: 0.75rem;
   min-width: 0;
}

.markdown-body :deep(.file-download-box .file-icon) {
   width: 36px;
   height: 36px;
   min-width: 36px;
   border-radius: 0.375rem;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
   font-size: 1.1rem;
}

.markdown-body :deep(.file-download-box .file-name) {
   font-size: 0.85rem;
   font-weight: 600;
   color: var(--app-text-color);
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
}

.markdown-body :deep(.file-download-box .file-size) {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color);
}

.markdown-body :deep(.file-download-box .btn-download) {
   display: inline-flex;
   align-items: center;
   gap: 0.35rem;
   font-size: 0.75rem;
   font-weight: 600;
   color: var(--app-text-color);
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   padding: 0.35rem 0.75rem;
   border-radius: 0.375rem;
   text-decoration: none;
   transition: all 0.2s ease;
}

.markdown-body :deep(.file-download-box .btn-download:hover) {
   border-color: var(--app-accent-color);
   color: var(--app-accent-color);
}

.markdown-body :deep(.plyr) {
   --plyr-color-main: var(--app-accent-color);
   --plyr-range-fill-background: var(--app-accent-color);
   --plyr-range-track-background: var(--app-border-color) !important;
   --plyr-video-range-track-background: var(--app-border-color) !important;
   --plyr-range-track-height: 4px;
   --plyr-range-thumb-height: 12px;
   --plyr-range-thumb-active-scale: 1.15;
   width: 100%;
   border-radius: 0.75rem;
   overflow: hidden;
   border: 1px solid var(--app-border-color);
   margin-top: 0.6rem;
   margin-bottom: 0.6rem;
}

.markdown-body :deep(.plyr--video) {
   aspect-ratio: 16 / 9;
   background: #000;
   height: 100%;
}

.markdown-body :deep(.plyr--audio) {
   --plyr-audio-controls-background: var(--app-bg);
   --plyr-audio-control-color: var(--app-text-color);
}

.markdown-body :deep(.plyr__control--overlaid) {
   background: var(--app-accent-color) !important;
   color: var(--app-accent-text-color) !important;
}

.markdown-body :deep(.plyr__control--overlaid:hover) {
   background: var(--app-accent-color) !important;
   opacity: 0.9 !important;
}

.markdown-body :deep(.plyr__control--overlaid svg) {
   fill: var(--app-accent-text-color) !important;
}

.markdown-body :deep(.plyr__video-wrapper) {
   height: 100% !important;
   padding-bottom: 0 !important;
   background: #000;
}

.markdown-body :deep(.plyr video) {
   width: 100% !important;
   height: 100% !important;
   object-fit: contain !important;
}

.markdown-body :deep(.plyr input[type=range]::-webkit-slider-runnable-track) {
   background: var(--app-border-color) !important;
}

.markdown-body :deep(.plyr__control:hover:not(.plyr__control--overlaid)) {
   background: var(--app-bg) !important;
   color: var(--app-accent-color) !important;
}
</style>