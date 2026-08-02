<template>
   <div class="container px-3 mb-5">
      <div v-if="!isAdmin" class="pin-form-card">
         <form @submit.prevent="login" class="pin-form-container">
            <div class="text-center mb-4">
               <div class="pin-icon-badge mb-2">
                  <i class="bi bi-shield-lock-fill"></i>
               </div>
               <h6 class="fw-bold mb-1 text-color">Security Verification</h6>
               <p class="fs-xs text-muted mb-0">Enter your 6-digit administrator PIN</p>
            </div>

            <div class="pin-inputs-wrapper d-flex justify-content-center gap-2 mb-4" @paste="handlePaste">
               <input v-for="(digit, idx) in digits" :key="idx" :ref="el => pinInputs[idx] = el as HTMLInputElement"
                  v-model="digits[idx]" type="text" inputmode="numeric" maxlength="1" class="form-control pin-box"
                  :disabled="loading" @input="handleInput($event, idx)" @keydown="handleKeydown($event, idx)"
                  @focus="handleFocus($event)" />
            </div>

            <button class="btn btn-custom-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
               :disabled="loading || pin.length < 6">
               <span v-if="loading" class="spinner-border spinner-border-sm"></span>
               <i v-else class="bi bi-unlock-fill"></i>
               <span>{{ loading ? 'Verifying...' : 'Unlock Admin' }}</span>
            </button>
         </form>
         <Alert type="danger mt-3" :show="!!error">{{ error }}</Alert>
      </div>

      <div v-else>
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
                           <label
                              class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Title</label>
                           <input v-model="form.title" class="form-control" placeholder="Enter note title..." required
                              :disabled="loading || isUploadingPhoto">
                        </div>

                        <div class="mb-3">
                           <div class="d-flex justify-content-between align-items-center mb-2">
                              <label
                                 class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted mb-0">Content</label>
                              <div class="toolbar d-flex align-items-center gap-1">
                                 <button type="button" class="btn btn-xs btn-outline-secondary" @click="wrap('**', '**')"
                                    title="Bold" :disabled="loading || isUploadingPhoto"><i
                                       class="bi bi-type-bold"></i></button>
                                 <button type="button" class="btn btn-xs btn-outline-secondary" @click="wrap('_', '_')"
                                    title="Italic" :disabled="loading || isUploadingPhoto"><i
                                       class="bi bi-type-italic"></i></button>
                                 <button type="button" class="btn btn-xs btn-outline-secondary" @click="insert('\n- ')"
                                    title="List" :disabled="loading || isUploadingPhoto"><i
                                       class="bi bi-list-ul"></i></button>
                                 <button type="button" class="btn btn-xs btn-outline-secondary" @click="wrap('`', '`')"
                                    title="Code" :disabled="loading || isUploadingPhoto"><i
                                       class="bi bi-code"></i></button>
                                 <button type="button" class="btn btn-xs btn-outline-secondary"
                                    @click="imageInput?.click()" title="Upload Photo"
                                    :disabled="loading || isUploadingPhoto"><i class="bi bi-image"></i> Photo</button>
                                 <input ref="imageInput" type="file" class="d-none" accept="image/*"
                                    @change="uploadPhoto" :disabled="isUploadingPhoto">
                              </div>
                           </div>

                           <div class="textarea-wrapper position-relative">
                              <textarea ref="editor" v-model="form.content" class="form-control note-textarea" rows="11"
                                 placeholder="Write content here..." required
                                 :disabled="loading || isUploadingPhoto"></textarea>
                              <div v-if="isUploadingPhoto"
                                 class="upload-overlay d-flex flex-column align-items-center justify-content-center">
                                 <div class="spinner-border spinner-border-sm text-accent mb-2" role="status"></div>
                                 <span class="fs-xs fw-semibold text-color">Uploading photo...</span>
                              </div>
                           </div>
                        </div>

                        <div class="form-check form-switch mb-4">
                           <input id="privateSwitch" v-model="form.is_private" class="form-check-input" type="checkbox"
                              :disabled="loading || isUploadingPhoto">
                           <label class="form-check-label fs-sm text-color fw-semibold" for="privateSwitch">Private</label>
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
   </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useNuxtApp, useState } from '#app'

const { $api } = useNuxtApp()
const isAdmin = useState<boolean>('admin-status', () => false)
const loading = ref(false)
const isUploadingPhoto = ref(false)
const error = ref('')

const digits = ref(['', '', '', '', '', ''])
const pinInputs = ref<HTMLInputElement[]>([])
const pin = computed(() => digits.value.join(''))

const notes = ref<any[]>([])
const page = ref(1)
const perPage = ref(10)
const totalNotes = ref(0)
const editor = ref<HTMLTextAreaElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const form = ref<any>({ id: '', title: '', content: '', is_private: false })

const check = async () => {
   try {
      const r = await $api('/api/admin/me')
      isAdmin.value = !!r.data.admin
      if (isAdmin.value) {
         fetchNotes()
      } else {
         nextTick(() => pinInputs.value[0]?.focus())
      }
   } catch {
      isAdmin.value = false
   }
}

const handleInput = (e: Event, idx: number) => {
   const val = (e.target as HTMLInputElement).value.replace(/\D/g, '')
   digits.value[idx] = val.slice(-1)
   if (val && idx < 5) {
      pinInputs.value[idx + 1]?.focus()
   }
   if (pin.value.length === 6) {
      login()
   }
}

const handleKeydown = (e: KeyboardEvent, idx: number) => {
   if (e.key === 'Backspace' && !digits.value[idx] && idx > 0) {
      digits.value[idx - 1] = ''
      pinInputs.value[idx - 1]?.focus()
   }
}

const handleFocus = (e: FocusEvent) => {
   (e.target as HTMLInputElement).select()
}

const handlePaste = (e: ClipboardEvent) => {
   e.preventDefault()
   const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
   if (!pasted) return
   for (let i = 0; i < 6; i++) {
      digits.value[i] = pasted[i] || ''
   }
   const nextIdx = Math.min(pasted.length, 5)
   pinInputs.value[nextIdx]?.focus()
   if (pin.value.length === 6) {
      login()
   }
}

const login = async () => {
   if (pin.value.length < 6) return
   loading.value = true
   error.value = ''
   try {
      await $api('/api/admin/login', { method: 'POST', body: { pin: pin.value } })
      await check()
   } catch (e: any) {
      error.value = e.data?.message || e.message || 'Login failed'
      digits.value = ['', '', '', '', '', '']
      nextTick(() => pinInputs.value[0]?.focus())
   } finally {
      loading.value = false
   }
}

const logout = async () => {
   await $api('/api/admin/logout', { method: 'POST' })
   isAdmin.value = false
   notes.value = []
   digits.value = ['', '', '', '', '', '']
   nextTick(() => pinInputs.value[0]?.focus())
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

const goToPage = async (target: number) => {
   page.value = Math.max(1, target)
   await fetchNotes()
}

const handlePerPageChange = async (newPerPage: number) => {
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

const editNote = (n: any) => {
   form.value = { id: n.id, title: n.title, content: n.content, is_private: !!n.is_private }
}

const removeNote = async (id: string) => {
   if (!confirm('Delete this note?')) return
   await $api(`/api/notes/${id}`, { method: 'DELETE' })
   if (notes.value.length === 1 && page.value > 1) page.value--
   fetchNotes()
}

const resetForm = () => {
   form.value = { id: '', title: '', content: '', is_private: false }
}

const insert = (text: string) => {
   form.value.content += text
}

const wrap = (a: string, b: string) => {
   const el = editor.value
   if (!el) return insert(a + b)
   const s = el.selectionStart, e = el.selectionEnd
   form.value.content = form.value.content.slice(0, s) + a + form.value.content.slice(s, e) + b + form.value.content.slice(e)
}

const uploadPhoto = async (ev: Event) => {
   const file = (ev.target as HTMLInputElement).files?.[0]
   if (!file) return
   isUploadingPhoto.value = true
   try {
      const fd = new FormData()
      fd.append('file', file)
      const r: any = await $fetch('/api/upload', { method: 'POST', body: fd })
      insert(`\n![${file.name}](${r.data.url})\n`)
   } catch (e: any) {
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

.note-textarea {
   font-family: inherit;
   resize: vertical;
}

.textarea-wrapper {
   position: relative;
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

.pin-form-card {
   max-width: 400px;
   margin: 3rem auto;
   padding: 1.5rem;
   background: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.75rem;
}

.pin-icon-badge {
   width: 48px;
   height: 48px;
   margin: 0 auto;
   border-radius: 50%;
   background: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.4rem;
   color: var(--app-accent-color);
}

.pin-box {
   width: 44px;
   height: 50px;
   text-align: center;
   font-size: 1.25rem;
   font-weight: 700;
   border-radius: 0.5rem;
   background-color: var(--app-bg) !important;
   border: 1px solid var(--app-border-color) !important;
   color: var(--app-text-color) !important;
   transition: border-color 0.2s ease;
}

.pin-box:focus {
   border-color: var(--app-accent-color) !important;
}
</style>