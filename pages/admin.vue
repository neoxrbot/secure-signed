<template>
   <div class="container px-3 mb-5">
      <div class="content-card p-4">
         <div class="d-flex justify-content-between align-items-center mb-3">
            <div><h4 class="mb-1">Admin Notes</h4><p class="text-muted mb-0 fs-sm">Login, create notes, and manage markdown notes.</p></div>
            <button v-if="isAdmin" class="btn btn-outline-secondary" @click="logout">Logout</button>
         </div>

         <form v-if="!isAdmin" @submit.prevent="login" class="row g-2">
            <div class="col-md-8"><input v-model="pin" class="form-control" inputmode="numeric" maxlength="6" placeholder="6 digit admin PIN" required></div>
            <div class="col-md-4"><button class="btn btn-custom-accent w-100" :disabled="loading">Login Admin</button></div>
         </form>

         <div v-else>
            <form @submit.prevent="saveNote" class="mb-4">
               <div class="mb-2"><input v-model="form.title" class="form-control" placeholder="Note title" required></div>
               <div class="toolbar mb-2 d-flex flex-wrap gap-2">
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="wrap('**','**')">Bold</button>
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="wrap('_','_')">Italic</button>
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="insert('\n- item')">List</button>
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="imageInput?.click()">Upload Foto</button>
                  <input ref="imageInput" type="file" class="d-none" accept="image/*" @change="uploadPhoto">
               </div>
               <textarea ref="editor" v-model="form.content" class="form-control note-editor" rows="9" placeholder="Write markdown content..." required></textarea>
               <div class="form-check form-switch my-3">
                  <input id="privateSwitch" v-model="form.is_private" class="form-check-input" type="checkbox">
                  <label class="form-check-label" for="privateSwitch">Private note (admin only)</label>
               </div>
               <button class="btn btn-custom-accent" :disabled="loading">{{ form.id ? 'Update Note' : 'Create Note' }}</button>
               <button v-if="form.id" type="button" class="btn btn-outline-secondary ms-2" @click="resetForm">Cancel</button>
            </form>

            <div class="d-flex justify-content-between align-items-center mb-2">
               <span class="fs-xs text-muted">Showing {{ pagination.from }}-{{ pagination.to }} of {{ pagination.total }} notes</span>
               <select v-model.number="perPage" class="form-select form-select-sm per-page-select" @change="goToPage(1)">
                  <option :value="5">5 / page</option>
                  <option :value="10">10 / page</option>
                  <option :value="20">20 / page</option>
               </select>
            </div>

            <div class="list-group note-list">
               <div v-for="note in notes" :key="note.id" class="list-group-item">
                  <div class="d-flex justify-content-between gap-2">
                     <div><NuxtLink :to="`/note/${note.id}`" class="fw-bold">{{ note.title }}</NuxtLink><div class="fs-xs text-muted">{{ note.reads }} reads • {{ formatDate(note.created_at) }} <span v-if="note.is_private">• Private</span></div></div>
                     <div class="d-flex gap-2"><button class="btn btn-sm btn-outline-secondary" @click="editNote(note)">Edit</button><button class="btn btn-sm btn-outline-danger" @click="removeNote(note.id)">Delete</button></div>
                  </div>
               </div>
               <div v-if="!notes.length" class="list-group-item text-muted fs-sm">No notes yet.</div>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3">
               <button class="btn btn-sm btn-outline-secondary" :disabled="page <= 1 || loading" @click="goToPage(page - 1)">Previous</button>
               <span class="fs-xs text-muted">Page {{ page }} / {{ totalPages }}</span>
               <button class="btn btn-sm btn-outline-secondary" :disabled="page >= totalPages || loading" @click="goToPage(page + 1)">Next</button>
            </div>
         </div>
         <Alert type="danger mt-3" :show="!!error">{{ error }}</Alert>
      </div>
   </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
const { $api } = useNuxtApp()
const isAdmin = ref(false), loading = ref(false), error = ref(''), pin = ref('')
const notes = ref<any[]>([])
const page = ref(1), perPage = ref(10), totalNotes = ref(0)
const editor = ref<HTMLTextAreaElement | null>(null), imageInput = ref<HTMLInputElement | null>(null)
const form = ref<any>({ id: '', title: '', content: '', is_private: false })
const check = async () => { const r = await $api('/api/admin/me'); isAdmin.value = !!r.data.admin; if (isAdmin.value) fetchNotes() }
const login = async () => { loading.value = true; error.value=''; try { await $api('/api/admin/login', { method:'POST', body:{ pin: pin.value }}); await check() } catch(e:any){ error.value=e.data?.message||'Login failed' } finally { loading.value=false } }
const logout = async () => { await $api('/api/admin/logout', { method:'POST' }); isAdmin.value=false; notes.value=[] }
const totalPages = computed(() => Math.max(Math.ceil(totalNotes.value / perPage.value), 1))
const pagination = computed(() => ({
   total: totalNotes.value,
   from: totalNotes.value ? ((page.value - 1) * perPage.value) + 1 : 0,
   to: Math.min(page.value * perPage.value, totalNotes.value)
}))
const fetchNotes = async () => {
   const r = await $api(`/api/notes?page=${page.value}&per_page=${perPage.value}`)
   notes.value = r.data || []
   totalNotes.value = r.meta?.total || notes.value.length
   page.value = r.meta?.page || page.value
}
const goToPage = async (target:number) => { page.value = Math.min(Math.max(target, 1), totalPages.value); await fetchNotes() }
const saveNote = async () => { loading.value=true; try { await $api(form.value.id ? `/api/notes/${form.value.id}` : '/api/notes', { method: form.value.id ? 'PUT':'POST', body: form.value }); resetForm(); goToPage(1) } finally { loading.value=false } }
const editNote = (n:any) => { form.value = { id:n.id, title:n.title, content:n.content, is_private:!!n.is_private } }
const removeNote = async (id:string) => { if (!confirm('Delete this note?')) return; await $api(`/api/notes/${id}`, { method:'DELETE' }); if (notes.value.length === 1 && page.value > 1) page.value--; fetchNotes() }
const resetForm = () => { form.value = { id:'', title:'', content:'', is_private:false } }
const insert = (text:string) => { form.value.content += text }
const wrap = (a:string,b:string) => { const el=editor.value; if(!el) return insert(a+b); const s=el.selectionStart,e=el.selectionEnd; form.value.content=form.value.content.slice(0,s)+a+form.value.content.slice(s,e)+b+form.value.content.slice(e) }
const uploadPhoto = async (ev:Event) => { const file=(ev.target as HTMLInputElement).files?.[0]; if(!file) return; const fd=new FormData(); fd.append('file', file); const r:any=await $fetch('/api/upload',{method:'POST',body:fd}); insert(`\n![${file.name}](${r.data.url})\n`) }
const formatDate = (v:number) => new Date(v).toLocaleString()
onMounted(check)
</script>
<style scoped>.fs-sm{font-size:.875rem}.fs-xs{font-size:.75rem}.text-muted{color:var(--app-secondary-text-color)!important}.note-editor{font-family:monospace}.note-list .list-group-item{background:var(--app-bg);color:var(--app-text-color);border-color:var(--app-border-color)}.per-page-select{width:auto}a{color:var(--app-text-color)}</style>
