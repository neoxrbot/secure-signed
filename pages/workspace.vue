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
         <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-secondary btn-icon-only" @click="handleBackup" :disabled="isBackingUp"
               title="Download Database Backup">
               <span v-if="isBackingUp" class="spinner-border spinner-border-sm"></span>
               <i v-else class="bi bi-database-down"></i>
            </button>
            <button class="btn btn-outline-secondary btn-icon-only" @click="logout" title="Logout">
               <i class="bi bi-box-arrow-right"></i>
            </button>
         </div>
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
                        <label class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Thumbnail
                           (Optional)</label>
                        <div class="input-group">
                           <input v-model="form.thumbnail" class="form-control"
                              placeholder="Image URL or upload photo..." :disabled="loading || isUploadingPhoto">
                           <button type="button" class="btn btn-outline-secondary" @click="thumbInput?.click()"
                              :disabled="loading || isUploadingPhoto" title="Upload Thumbnail">
                              <i class="bi bi-image"></i>
                           </button>
                        </div>
                        <input ref="thumbInput" type="file" class="d-none" accept="image/*" @change="uploadThumbnail"
                           :disabled="isUploadingPhoto">

                        <div class="mt-2 d-flex align-items-center gap-2">
                           <div class="thumb-preview-box">
                              <img v-if="form.thumbnail" :src="form.thumbnail" class="thumb-img" />
                              <div v-else class="thumb-letter-avatar">
                                 {{ firstLetter }}
                              </div>
                           </div>
                           <span class="fs-xs text-muted">{{ form.thumbnail ? 'Custom thumbnail image set' : 'Fallback letter avatar will be used' }}</span>
                        </div>
                     </div>

                     <div class="mb-3">
                        <label class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Tags (Comma
                           Separated)</label>
                        <input v-model="form.tags" class="form-control" placeholder="e.g. tech, nuxt, tutorial"
                           :disabled="loading || isUploadingPhoto">
                        <div v-if="parsedTags.length" class="d-flex gap-2 flex-wrap mt-2">
                           <span v-for="tag in parsedTags" :key="tag" class="tag-preview-item">#{{ tag }}</span>
                        </div>
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
import { ref, computed, watch, nextTick, reactive, onMounted, onUnmounted } from 'vue'
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
const isBackingUp = ref(false)
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
const thumbInput = ref(null)
const form = ref({ id: '', title: '', content: '', thumbnail: '', tags: '', is_private: true })

const md = new MarkdownIt({ html: true, linkify: true, breaks: true })

const firstLetter = computed(() => {
   const t = (form.value.title || '').trim()
   return t ? t.charAt(0).toUpperCase() : 'N'
})

const parsedTags = computed(() => {
   if (!form.value.tags) return []
   return form.value.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
})

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

const handleBackup = async () => {
   isBackingUp.value = true
   try {
      const res = await $fetch('/api/backup?secret=neoxr', { responseType: 'blob' })
      const blob = new Blob([res], { type: 'text/x-sql' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `d1_backup_${new Date().toISOString().slice(0, 10)}.sql`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
   } catch (e) {
      error.value = e.message || 'Backup failed'
   } finally {
      isBackingUp.value = false
   }
}

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

watch([isPreview, previewHtml], async () => {
   if (isPreview.value) {
      await nextTick()
      if (typeof window !== 'undefined') {
         Prism.highlightAll()
         initPlyr()
         setupImageLightbox()
         setupCodeCopyButtons()
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
      const payload = {
         ...form.value,
         tags: parsedTags.value
      }
      await $api(form.value.id ? `/api/notes/${form.value.id}` : '/api/notes', {
         method: form.value.id ? 'PUT' : 'POST',
         body: payload
      })
      resetForm()
      goToPage(1)
   } finally {
      loading.value = false
   }
}

const editNote = (n) => {
   form.value = {
      id: n.id,
      title: n.title,
      content: n.content,
      thumbnail: n.thumbnail || '',
      tags: Array.isArray(n.tags) ? n.tags.join(', ') : (n.tags || ''),
      is_private: !!n.is_private
   }
}

const removeNote = async (id) => {
   if (!confirm('Delete this note?')) return
   await $api(`/api/notes/${id}`, { method: 'DELETE' })
   if (notes.value.length === 1 && page.value > 1) page.value--
   fetchNotes()
}

const resetForm = () => {
   form.value = { id: '', title: '', content: '', thumbnail: '', tags: '', is_private: true }
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

const uploadThumbnail = async (ev) => {
   const file = ev.target.files?.[0]
   if (!file) return
   isUploadingPhoto.value = true
   try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await $fetch('/api/upload', { method: 'POST', body: fd })
      const relativeUrl = r.data.url.replace(/^https?:\/\/[^\/]+/, '')
      form.value.thumbnail = relativeUrl
   } catch (e) {
      error.value = e.message || 'Thumbnail upload failed'
   } finally {
      isUploadingPhoto.value = false
      if (thumbInput.value) thumbInput.value.value = ''
   }
}

const buildGalleryHtml = (images) => {
   const main = images[0]
   const side = images.slice(1, 5)
   const extra = images.length - 5

   let html = '<div class="gallery-grid">'
   html += `<div class="grid-item item-main"><img src="${main.url}" alt="${main.name}"></div>`
   side.forEach((img, idx) => {
      const isLast = idx === side.length - 1 && extra > 0
      html += `<div class="grid-item"><img src="${img.url}" alt="${img.name}">`
      if (isLast) html += `<div class="more-overlay">+${extra} Foto</div>`
      html += `</div>`
   })
   html += '</div>'
   return `\n${html}\n`
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
         const tag = `\n<div class="file-download-box"><div class="file-info"><div class="file-icon"><i class="bi bi-file-earmark-arrow-down-fill"></i></div><div class="file-text-col"><div class="file-name">${file.name}</div><div class="file-size">${sizeStr}</div></div></div><a href="${relativeUrl}" download="${file.name}" class="btn-download"><i class="bi bi-download"></i> Download</a></div>\n`
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

onMounted(() => {
   check()
   if (typeof window !== 'undefined') window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
   if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
@import '@/assets/css/markdown.css';

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

.btn-icon-only {
   width: 32px;
   height: 32px;
   padding: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 0.375rem;
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

.tag-preview-item {
   font-size: 0.725rem;
   padding: 0.25rem 0.6rem;
   border-radius: 0.35rem;
   background-color: var(--app-bg);
   color: var(--app-text-color);
   border: 1px solid var(--app-border-color);
   font-weight: 600;
}

.thumb-preview-box {
   width: 36px;
   height: 36px;
   border-radius: 0.375rem;
   overflow: hidden;
   border: 1px solid var(--app-border-color);
   background-color: var(--app-bg);
   flex-shrink: 0;
}

.thumb-img {
   width: 100%;
   height: 100%;
   object-fit: cover;
}

.thumb-letter-avatar {
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-weight: 700;
   font-size: 1rem;
   color: var(--app-accent-color);
   background-color: var(--app-bg);
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