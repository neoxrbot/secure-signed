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
                              <button type="button" class="btn btn-xs btn-outline-secondary" @click="insert('\n- ')"
                                 title="List" :disabled="loading || isUploadingPhoto || isPreview"><i
                                    class="bi bi-list-ul"></i></button>
                              <button type="button" class="btn btn-xs btn-outline-secondary" @click="wrap('`', '`')"
                                 title="Code" :disabled="loading || isUploadingPhoto || isPreview"><i
                                    class="bi bi-code"></i></button>
                              <button type="button" class="btn btn-xs btn-outline-secondary"
                                 @click="imageInput?.click()" title="Upload Photo"
                                 :disabled="loading || isUploadingPhoto || isPreview"><i class="bi bi-image"></i>
                                 Photo</button>
                              <input ref="imageInput" type="file" class="d-none" accept="image/*" @change="uploadPhoto"
                                 :disabled="isUploadingPhoto || isPreview">
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
                              <span class="fs-xs fw-semibold text-color">Uploading photo...</span>
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

useHead({ title: 'Workspace' })

const { $api } = useNuxtApp()
const router = useRouter()
const isAdmin = useState('admin-status', () => false)

const loading = ref(false)
const isUploadingPhoto = ref(false)
const isPreview = ref(false)
const error = ref('')

const notes = ref([])
const page = ref(1)
const perPage = ref(5)
const totalNotes = ref(0)
const editor = ref(null)
const imageInput = ref(null)
const form = ref({ id: '', title: '', content: '', is_private: true })

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

const previewHtml = computed(() => {
   let text = form.value.content || ''
   if (!text.trim()) return ''
   text = text.replace(/[\u2010-\u2015\u2212]/g, '-')
   text = text.replace(/(?:\r?\n|^)\s*---+\s*(?=\r?\n|$)/g, '\n\n---\n\n')
   return md.render(text)
})

watch([isPreview, previewHtml], async () => {
   if (isPreview.value) {
      await nextTick()
      if (typeof window !== 'undefined') {
         Prism.highlightAll()
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

const insert = (text) => {
   form.value.content += text
}

const wrap = (a, b) => {
   const el = editor.value
   if (!el) return insert(a + b)
   const s = el.selectionStart, e = el.selectionEnd
   form.value.content = form.value.content.slice(0, s) + a + form.value.content.slice(s, e) + b + form.value.content.slice(e)
}

const uploadPhoto = async (ev) => {
   const file = ev.target.files?.[0]
   if (!file) return
   isUploadingPhoto.value = true
   try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await $fetch('/api/upload', { method: 'POST', body: fd })
      insert(`\n![${file.name}](${r.data.url.replace(/^https?:\/\/[^\/]+/, '')})\n`)
   } catch (e) {
      error.value = e.message || 'Photo upload failed'
   } finally {
      isUploadingPhoto.value = false
      if (imageInput.value) imageInput.value.value = ''
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
   border-radius: 0.5rem;
   border: 1px solid var(--app-border-color);
   margin-top: 0.25rem !important;
   margin-bottom: 0.25rem !important;
}
</style>