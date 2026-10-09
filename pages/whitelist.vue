<template>
   <div class="container px-3 mb-5">
      <!-- Header Workspace Style -->
      <div class="d-flex justify-content-between align-items-center mb-4 p-3 content-card">
         <div class="d-flex align-items-center gap-2">
            <div class="admin-icon-badge">
               <i class="bi bi-shield-check"></i>
            </div>
            <div>
               <h5 class="mb-0 fw-bold text-color">IP Whitelist</h5>
               <p class="text-muted mb-0 fs-xs">IPs that bypass the anti-spam protection</p>
            </div>
         </div>
         <div class="d-flex align-items-center gap-2">
            <NuxtLink to="/workspace" class="btn btn-outline-secondary btn-icon-only" title="Back to Workspace">
               <i class="bi bi-arrow-left"></i>
            </NuxtLink>
            <button class="btn btn-outline-secondary btn-icon-only" @click="fetchList" :disabled="loading" title="Refresh">
               <i class="bi bi-arrow-repeat" :class="{ 'spin': loading }"></i>
            </button>
         </div>
      </div>

      <!-- Alerts -->
      <Alert v-if="error" type="danger mb-4" :show="!!error">{{ error }}</Alert>
      <Alert v-if="success" type="success mb-4" :show="!!success">{{ success }}</Alert>

      <!-- Add IP Form Card -->
      <div class="note-editor-card mb-4">
         <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
               <div class="editor-badge"><i class="bi bi-plus-circle"></i></div>
               <div>
                  <h6 class="editor-title mb-0">Add IP to Whitelist</h6>
                  <span class="editor-subtitle">Exempt specific address from rate limit</span>
               </div>
            </div>
         </div>

         <div class="p-4">
            <form @submit.prevent="addIp">
               <div class="row g-3">
                  <div class="col-md-6">
                     <label class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">IP Address</label>
                     <input v-model="form.ip" class="form-control" placeholder="e.g. 203.0.113.5" required
                        :disabled="saving" />
                  </div>
                  <div class="col-md-6">
                     <label class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Note (Optional)</label>
                     <input v-model="form.note" class="form-control" placeholder="e.g. Office network, Home fiber..."
                        :disabled="saving" />
                  </div>
               </div>

               <div class="mt-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div v-if="myIp" class="d-flex align-items-center gap-2">
                     <span class="fs-xs text-muted">Your current IP:</span>
                     <code class="my-ip-badge">{{ myIp }}</code>
                     <button type="button" class="btn btn-xs btn-outline-secondary" @click="whitelistMyIp" :disabled="saving">
                        <i class="bi bi-shield-plus me-1"></i> Use my IP
                     </button>
                  </div>
                  <div v-else></div>

                  <button class="btn btn-custom-accent px-4 py-2 d-flex align-items-center justify-content-center gap-2"
                     :disabled="saving || !form.ip">
                     <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                     <i v-else class="bi bi-plus-lg"></i>
                     <span>Add to Whitelist</span>
                  </button>
               </div>
            </form>
         </div>
      </div>

      <!-- Whitelisted IPs List Card -->
      <div class="note-editor-card">
         <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
               <div class="editor-badge"><i class="bi bi-list-ul"></i></div>
               <div>
                  <h6 class="editor-title mb-0">Whitelisted Entries</h6>
                  <span class="editor-subtitle">{{ list.length }} record{{ list.length === 1 ? '' : 's' }} stored</span>
               </div>
            </div>
         </div>

         <div class="p-0">
            <div v-if="loading && !list.length" class="text-center py-5 text-muted">
               <span class="spinner-border spinner-border-sm me-2"></span>
               <span class="fs-sm">Loading records...</span>
            </div>

            <div v-else-if="!list.length" class="text-center py-5 text-muted">
               <i class="bi bi-inbox fs-2 d-block mb-2"></i>
               <span class="fs-sm">No whitelisted IPs found.</span>
            </div>

            <div v-else class="table-responsive">
               <table class="table align-middle mb-0 wl-table">
                  <thead>
                     <tr>
                        <th class="ps-4" scope="col">IP Address</th>
                        <th scope="col">Note</th>
                        <th scope="col">Added</th>
                        <th scope="col" class="text-end pe-4">Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="item in list" :key="item.ip">
                        <td class="ps-4">
                           <code class="wl-ip">{{ item.ip }}</code>
                        </td>
                        <td>
                           <span class="text-color fs-sm">{{ item.note || '—' }}</span>
                        </td>
                        <td>
                           <span class="text-muted fs-xs">{{ formatDate(item.created_at) }}</span>
                        </td>
                        <td class="text-end pe-4">
                           <button class="btn btn-outline-secondary btn-icon-only ms-auto btn-trash-hover"
                              @click="removeIp(item.ip)" :disabled="removing === item.ip"
                              title="Remove IP">
                              <span v-if="removing === item.ip" class="spinner-border spinner-border-sm"></span>
                              <i v-else class="bi bi-trash"></i>
                           </button>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp, useRouter, useState, useHead } from '#app'

useHead({ title: 'IP Whitelist' })

const { $api } = useNuxtApp()
const router = useRouter()
const isAdmin = useState('admin-status', () => false)

const loading = ref(false)
const saving = ref(false)
const removing = ref('')
const error = ref('')
const success = ref('')
const list = ref([])
const myIp = ref('')
const form = ref({ ip: '', note: '' })

const notify = (msg, type = 'success') => {
   if (type === 'success') {
      success.value = msg
      error.value = ''
      setTimeout(() => (success.value = ''), 2500)
   } else {
      error.value = msg
      success.value = ''
   }
}

const check = async () => {
   try {
      const r = await $api('/api/admin/me')
      if (!r?.data?.admin) {
         isAdmin.value = false
         router.replace('/login')
         return
      }
      isAdmin.value = true
      await fetchList()
      await fetchMyIp()
   } catch {
      isAdmin.value = false
      router.replace('/login')
   }
}

const fetchList = async () => {
   loading.value = true
   try {
      const r = await $api('/api/admin/whitelist')
      list.value = r?.data || []
   } catch (e) {
      notify(e?.data?.msg || e?.message || 'Failed to load whitelist', 'danger')
   } finally {
      loading.value = false
   }
}

const fetchMyIp = async () => {
   try {
      const r = await $api('/api/ip')
      myIp.value = r?.data?.ip || ''
   } catch {
      myIp.value = ''
   }
}

const addIp = async () => {
   saving.value = true
   try {
      await $api('/api/admin/whitelist', {
         method: 'POST',
         body: { ip: form.value.ip.trim(), note: form.value.note.trim() }
      })
      notify('IP added to whitelist')
      form.value = { ip: '', note: '' }
      await fetchList()
   } catch (e) {
      notify(e?.data?.msg || e?.message || 'Failed to add IP', 'danger')
   } finally {
      saving.value = false
   }
}

const whitelistMyIp = () => {
   if (!myIp.value) return
   form.value.ip = myIp.value
}

const removeIp = async (ip) => {
   if (!confirm(`Remove ${ip} from whitelist?`)) return
   removing.value = ip
   try {
      await $api(`/api/admin/whitelist?ip=${encodeURIComponent(ip)}`, { method: 'DELETE' })
      notify('IP removed from whitelist')
      await fetchList()
   } catch (e) {
      notify(e?.data?.msg || e?.message || 'Failed to remove IP', 'danger')
   } finally {
      removing.value = ''
   }
}

const formatDate = (ts) => {
   if (!ts) return '—'
   try {
      return new Date(ts * 1000).toLocaleString()
   } catch {
      return '—'
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

.btn-icon-only {
   width: 32px;
   height: 32px;
   padding: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 0.375rem;
}

.btn-xs {
   font-size: 0.75rem;
   padding: 0.2rem 0.5rem;
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

.my-ip-badge {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.375rem;
   padding: 0.2rem 0.5rem;
   color: var(--app-accent-color);
   font-size: 0.75rem;
}

.wl-table {
   color: var(--app-text-color);
   background-color: transparent !important;
}

.wl-table thead th {
   color: var(--app-secondary-text-color);
   font-size: 0.7rem;
   font-weight: 700;
   text-transform: uppercase;
   letter-spacing: 0.05em;
   padding-top: 0.85rem;
   padding-bottom: 0.85rem;
   border-bottom: 1px solid var(--app-border-color);
   background-color: var(--app-bg) !important;
}

.wl-table tbody td {
   padding-top: 0.85rem;
   padding-bottom: 0.85rem;
   border-bottom: 1px solid var(--app-border-color);
   background-color: transparent !important;
}

.wl-table tbody tr:last-child td {
   border-bottom: none;
}

.wl-ip {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.375rem;
   padding: 0.15rem 0.5rem;
   color: var(--app-text-color);
   font-size: 0.8rem;
}

.btn-trash-hover:hover {
   color: #dc3545 !important;
   border-color: rgba(220, 53, 69, 0.4) !important;
   background-color: rgba(220, 53, 69, 0.1) !important;
}

.spin {
   animation: spin 1s linear infinite;
}

@keyframes spin {
   from {
      transform: rotate(0deg);
   }
   to {
      transform: rotate(360deg);
   }
}
</style>