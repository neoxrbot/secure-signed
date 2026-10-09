<template>
   <div class="container px-3 mb-5">
      <div class="d-flex justify-content-between align-items-center mb-4 p-3 content-card">
         <div class="d-flex align-items-center gap-2">
            <div class="admin-icon-badge"><i class="bi bi-shield-check"></i></div>
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

      <div v-if="error" class="mb-3">
         <Alert type="danger" :show="!!error">{{ error }}</Alert>
      </div>
      <div v-if="success" class="mb-3">
         <Alert type="success" :show="!!success">{{ success }}</Alert>
      </div>

      <div class="content-card p-4 mb-4">
         <h6 class="fw-bold mb-3 text-color"><i class="bi bi-plus-circle me-1"></i> Add IP to Whitelist</h6>
         <form @submit.prevent="addIp" class="row g-2 align-items-end">
            <div class="col-sm-5">
               <label class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">IP Address</label>
               <input v-model="form.ip" class="form-control" placeholder="e.g. 203.0.113.5" required
                  :disabled="saving" />
            </div>
            <div class="col-sm-5">
               <label class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Note
                  (optional)</label>
               <input v-model="form.note" class="form-control" placeholder="e.g. Office network" :disabled="saving" />
            </div>
            <div class="col-sm-2 d-grid">
               <button class="btn btn-custom-accent d-flex align-items-center justify-content-center gap-2"
                  :disabled="saving || !form.ip">
                  <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-shield-plus"></i>
                  <span>Add</span>
               </button>
            </div>
         </form>

         <div v-if="myIp" class="mt-3 d-flex align-items-center gap-2 flex-wrap">
            <span class="fs-xs text-muted">Your current IP:</span>
            <code class="my-ip-badge">{{ myIp }}</code>
            <button class="btn btn-xs btn-outline-secondary" @click="whitelistMyIp" :disabled="saving">
               <i class="bi bi-plus-lg me-1"></i> Whitelist my IP
            </button>
         </div>
      </div>

      <div class="content-card p-0 overflow-hidden">
         <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
               <div class="editor-badge"><i class="bi bi-list-ul"></i></div>
               <div>
                  <h6 class="editor-title mb-0">Whitelisted IPs</h6>
                  <span class="editor-subtitle">{{ list.length }} entr{{ list.length === 1 ? 'y' : 'ies' }}</span>
               </div>
            </div>
         </div>

         <div class="p-3">
            <div v-if="loading && !list.length" class="text-center py-4 text-muted">
               <span class="spinner-border spinner-border-sm me-2"></span> Loading...
            </div>

            <div v-else-if="!list.length" class="text-center py-4 text-muted">
               <i class="bi bi-inbox fs-3 d-block mb-2"></i>
               No whitelisted IPs yet.
            </div>

            <div v-else class="table-responsive">
               <table class="table align-middle mb-0 wl-table">
                  <thead>
                     <tr>
                        <th scope="col">IP Address</th>
                        <th scope="col">Note</th>
                        <th scope="col">Added</th>
                        <th scope="col" class="text-end">Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="item in list" :key="item.ip">
                        <td><code class="wl-ip">{{ item.ip }}</code></td>
                        <td class="text-muted">{{ item.note || '—' }}</td>
                        <td class="text-muted fs-xs">{{ formatDate(item.created_at) }}</td>
                        <td class="text-end">
                           <button class="btn btn-sm btn-outline-danger"
                              @click="removeIp(item.ip)" :disabled="removing === item.ip"
                              title="Remove">
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
   addIp()
}

const removeIp = async (ip) => {
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

.text-color {
   color: var(--app-text-color) !important;
}

.text-muted {
   color: var(--app-secondary-text-color) !important;
}

.admin-icon-badge {
   width: 44px;
   height: 44px;
   border-radius: 0.625rem;
   background: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.25rem;
   color: var(--app-accent-color);
   flex-shrink: 0;
}

.editor-badge {
   width: 36px;
   height: 36px;
   border-radius: 0.5rem;
   background: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1rem;
   color: var(--app-accent-color);
   flex-shrink: 0;
}

.editor-title {
   color: var(--app-text-color);
   font-weight: 700;
}

.editor-subtitle {
   color: var(--app-secondary-text-color);
   font-size: 0.75rem;
}

.tracking-wider {
   letter-spacing: 0.05em;
}

.my-ip-badge {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.375rem;
   padding: 0.15rem 0.5rem;
   color: var(--app-accent-color);
   font-size: 0.8rem;
}

.wl-table {
   color: var(--app-text-color);
}

.wl-table thead th {
   color: var(--app-secondary-text-color);
   font-size: 0.72rem;
   font-weight: 700;
   text-transform: uppercase;
   letter-spacing: 0.05em;
   border-bottom: 1px solid var(--app-border-color);
   background-color: transparent;
}

.wl-table tbody td {
   border-bottom: 1px solid var(--app-border-color);
   background-color: transparent;
}

.wl-table tbody tr:last-child td {
   border-bottom: none;
}

.wl-ip {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.375rem;
   padding: 0.1rem 0.5rem;
   color: var(--app-text-color);
}

.btn-xs {
   padding: 0.15rem 0.5rem;
   font-size: 0.75rem;
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