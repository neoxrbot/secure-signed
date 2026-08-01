<template>
   <div class="container px-3 mb-5">
      <!-- Top Stats Row -->
      <div class="row g-3 mb-4">
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-body-text"></i></div>
               <div>
                  <div class="value">{{ stats.total_proxied.toLocaleString() }}</div>
                  <div class="label">Total Proxied</div>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-cloud-download"></i></div>
               <div>
                  <div class="value">{{ formatBytes(stats.total_download_size) }}</div>
                  <div class="label">Total Downloaded</div>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-folder-check"></i></div>
               <div>
                  <div class="value">{{ stats.total_files.toLocaleString() }}</div>
                  <div class="label">Total Files</div>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-hdd-stack"></i></div>
               <div>
                  <div class="value">{{ formatBytes(stats.total_files_size) }}</div>
                  <div class="label">Total Size</div>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-link-45deg"></i></div>
               <div>
                  <div class="value">{{ stats.total_shorts.toLocaleString() }}</div>
                  <div class="label">Short URLs</div>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-eye"></i></div>
               <div>
                  <div class="value">{{ stats.total_views.toLocaleString() }}</div>
                  <div class="label">Short Views</div>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-lightning-charge"></i></div>
               <div>
                  <div class="value">{{ stats.hits_today.toLocaleString() }}</div>
                  <div class="label">Hits Daily</div>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-box">
               <div class="icon-box"><i class="bi bi-activity"></i></div>
               <div>
                  <div class="value">{{ stats.total_hits.toLocaleString() }}</div>
                  <div class="label">Total Hits</div>
               </div>
            </div>
         </div>
      </div>

      <!-- Core Tools Navigation Tabs -->
      <div class="content-card p-4">
         <ul class="nav nav-pills gap-2 mb-4">
            <li class="nav-item">
               <button class="nav-link" :class="{ active: activeTab === 'upload' }" @click="activeTab = 'upload'">
                  <i class="bi bi-upload me-1"></i> Upload Files
               </button>
            </li>
            <li class="nav-item">
               <button class="nav-link" :class="{ active: activeTab === 'shorten' }" @click="activeTab = 'shorten'">
                  <i class="bi bi-link-45deg me-1"></i> Shorten URL
               </button>
            </li>
            <li class="nav-item">
               <button class="nav-link" :class="{ active: activeTab === 'cdn' }" @click="activeTab = 'cdn'">
                  <i class="bi bi-shield-check me-1"></i> Proxy CDN Sign
               </button>
            </li>
            <li class="nav-item">
               <button class="nav-link" :class="{ active: activeTab === 'proxy' }" @click="activeTab = 'proxy'">
                  <i class="bi bi-globe me-1"></i> Web Proxy
               </button>
            </li>
         </ul>

         <!-- Tab 1: Upload Files -->
         <div v-if="activeTab === 'upload'">
            <div class="mb-3">
               <label class="form-label">Select Files (Max 20MB per file, Multiple allowed)</label>
               <input type="file" multiple class="form-control" @change="onFilesSelected">
            </div>
            <button class="btn btn-custom-accent" :disabled="isUploading || selectedFiles.length === 0"
               @click="uploadFiles">
               {{ isUploading ? 'Uploading to Telegram...' : 'Upload Files' }}
            </button>

            <div v-if="uploadResults.length > 0" class="mt-4">
               <h6>Upload Results:</h6>
               <div v-for="(res, idx) in uploadResults" :key="idx"
                  class="p-2 border rounded mb-2 d-flex justify-content-between align-items-center">
                  <span>{{ res.original_name }}</span>
                  <span v-if="res.status">
                     <a :href="res.url" target="_blank" class="badge bg-success text-decoration-none">Download Link</a>
                  </span>
                  <span v-else class="badge bg-danger">{{ res.msg }}</span>
               </div>
            </div>
         </div>

         <!-- Tab 2: URL Shortener -->
         <div v-else-if="activeTab === 'shorten'">
            <div class="mb-3">
               <label class="form-label">Enter Long URL</label>
               <input type="url" class="form-control" v-model="longUrl" placeholder="https://example.com/very/long/url">
            </div>
            <button class="btn btn-custom-accent" @click="handleShorten">Shorten URL</button>

            <div v-if="shortResult" class="mt-3">
               <label class="form-label">Result:</label>
               <div class="input-group">
                  <input type="text" class="form-control" :value="shortResult" readonly>
                  <button class="btn btn-outline-secondary" @click="copyToClipboard(shortResult)">Copy</button>
               </div>
            </div>
         </div>

         <!-- Tab 3: Proxy CDN Signer -->
         <div v-else-if="activeTab === 'cdn'">
            <div class="row g-3">
               <div class="col-md-6">
                  <label class="form-label">Source File URL</label>
                  <input type="url" class="form-control" v-model="cdnUrl" placeholder="https://my.neoxr.eu/file.zip">
               </div>
               <div class="col-md-6">
                  <label class="form-label">Filename (Optional)</label>
                  <input type="text" class="form-control" v-model="cdnFilename" placeholder="my-file.zip">
               </div>
            </div>
            <button class="btn btn-custom-accent mt-3" @click="generateCdn">Generate Signed CDN Link</button>

            <div v-if="cdnResult" class="mt-3">
               <label class="form-label">Signed CDN Link (Max 500MB, Expired 15 mins):</label>
               <div class="input-group">
                  <input type="text" class="form-control" :value="cdnResult" readonly>
                  <button class="btn btn-outline-secondary" @click="copyToClipboard(cdnResult)">Copy</button>
               </div>
            </div>
         </div>

         <!-- Tab 4: Web Proxy -->
         <div v-else-if="activeTab === 'proxy'">
            <div class="mb-3">
               <label class="form-label">Target URL to Proxy</label>
               <input type="url" class="form-control" v-model="proxyTarget" placeholder="https://api.github.com">
            </div>
            <button class="btn btn-custom-accent" @click="executeProxy">Get Proxy Link</button>

            <div v-if="proxyResult" class="mt-3">
               <label class="form-label">Proxy Link:</label>
               <div class="input-group">
                  <input type="text" class="form-control" :value="proxyResult" readonly>
                  <a :href="proxyResult" target="_blank" class="btn btn-outline-secondary">Open Target</a>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const activeTab = ref('upload')
const stats = ref({
   total_proxied: 0,
   total_download_size: 0,
   total_files: 0,
   total_files_size: 0,
   total_shorts: 0,
   total_views: 0,
   hits_today: 0,
   total_hits: 0
})

// Upload State
const selectedFiles = ref([])
const uploadResults = ref([])
const isUploading = ref(false)

// Shortener State
const longUrl = ref('')
const shortResult = ref('')

// CDN State
const cdnUrl = ref('')
const cdnFilename = ref('')
const cdnResult = ref('')

// Proxy State
const proxyTarget = ref('')
const proxyResult = ref('')

const fetchStats = async () => {
   try {
      const res = await $fetch('/api/stats')
      if (res.status) stats.value = res.data
   } catch (err) { }
}

const formatBytes = (bytes) => {
   if (!bytes || bytes === 0) return '0 B'
   const k = 1024
   const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
   const i = Math.floor(Math.log(bytes) / Math.log(k))
   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const onFilesSelected = (e) => {
   selectedFiles.value = Array.from(e.target.files)
}

const uploadFiles = async () => {
   if (selectedFiles.value.length === 0) return
   isUploading.value = true
   uploadResults.value = []

   // Unggah file SATU PER SATU agar tidak melebihi batas waktu (timeout) Cloudflare Worker
   for (const file of selectedFiles.value) {
      const fd = new FormData()
      fd.append('files', file)

      try {
         const res = await $fetch('/api/upload', {
            method: 'POST',
            body: fd
         })

         if (res.status && res.data.length > 0) {
            uploadResults.value.push(...res.data)
         }
      } catch (err) {
         uploadResults.value.push({
            original_name: file.name,
            status: false,
            msg: err.data?.msg || err.message || 'Upload failed'
         })
      }
   }

   isUploading.value = false
   fetchStats()
}

const handleShorten = async () => {
   try {
      const res = await $fetch('/api/short', { method: 'POST', body: { url: longUrl.value } })
      if (res.status) shortResult.value = res.data.url
      fetchStats()
   } catch (err) { }
}

const generateCdn = async () => {
   try {
      const res = await $fetch('/api/cdn/sign', {
         method: 'POST',
         body: { target_url: cdnUrl.value, filename: cdnFilename.value }
      })
      if (res.status) cdnResult.value = res.data.signed_url
      fetchStats()
   } catch (err) { }
}

const executeProxy = () => {
   proxyResult.value = `${window.location.origin}/proxy?url=${encodeURIComponent(proxyTarget.value)}`
}

const copyToClipboard = (text) => {
   navigator.clipboard.writeText(text)
   alert('Copied to clipboard!')
}

onMounted(() => {
   fetchStats()
})
</script>

<style scoped>
.stat-box {
   display: flex;
   align-items: center;
   gap: 1rem;
   padding: 1rem;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: .5rem;
}

.icon-box {
   width: 40px;
   height: 40px;
   border-radius: 8px;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.25rem;
   background-color: var(--app-bg);
   color: var(--app-accent-color);
}

.stat-box .value {
   font-size: 1.15rem;
   font-weight: 700;
}

.stat-box .label {
   font-size: 0.75rem;
   color: var(--app-secondary-text-color);
}

.nav-pills .nav-link {
   color: var(--app-secondary-text-color);
   background: var(--app-bg);
}

.nav-pills .nav-link.active {
   background-color: var(--app-accent-color);
   color: #fff;
}
</style>