<template>
   <div class="container px-3 mb-5">
      <div class="row g-3 mb-4">
         <div class="col-6 col-md-3">
            <div class="stat-card">
               <div class="stat-icon"><i class="bi bi-files"></i></div>
               <div class="stat-details">
                  <span class="stat-label">Total Files</span>
                  <h4 class="stat-value">{{ stats.totalFiles.toLocaleString() }}</h4>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-card">
               <div class="stat-icon"><i class="bi bi-database"></i></div>
               <div class="stat-details">
                  <span class="stat-label">Total Size</span>
                  <h4 class="stat-value">{{ formatBytes(stats.totalSize) }}</h4>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-card">
               <div class="stat-icon"><i class="bi bi-download"></i></div>
               <div class="stat-details">
                  <span class="stat-label">Downloads</span>
                  <h4 class="stat-value">{{ formatBytes(stats.totalDownloads) }}</h4>
               </div>
            </div>
         </div>
         <div class="col-6 col-md-3">
            <div class="stat-card">
               <div class="stat-icon"><i class="bi bi-activity"></i></div>
               <div class="stat-details">
                  <span class="stat-label">API Hits</span>
                  <h4 class="stat-value">{{ stats.apiHits.toLocaleString() }}</h4>
               </div>
            </div>
         </div>
      </div>

      <div class="row g-4 align-items-start">
         <div class="col-lg-7">
            <div class="tool-center-card h-100 d-flex flex-column">
               <div
                  class="tool-header p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div class="d-flex align-items-center gap-2">
                     <div class="tool-badge"><i class="bi bi-cpu-fill"></i></div>
                     <div>
                        <h6 class="tool-title mb-0">Services</h6>
                        <span class="tool-subtitle">Select action tab</span>
                     </div>
                  </div>
                  <div class="nav-segmented">
                     <button class="nav-segmented-btn" :class="{ 'active': activeView === 'upload' }"
                        @click="switchTab('upload')" :disabled="isUploading">
                        <i class="bi bi-cloud-arrow-up-fill me-1"></i> Upload
                     </button>
                     <button class="nav-segmented-btn" :class="{ 'active': activeView === 'sign' }"
                        @click="switchTab('sign')" :disabled="isUploading">
                        <i class="bi bi-shield-lock-fill me-1"></i> Sign
                     </button>
                     <button class="nav-segmented-btn" :class="{ 'active': activeView === 'shorten' }"
                        @click="switchTab('shorten')" :disabled="isUploading">
                        <i class="bi bi-link-45deg me-1"></i> Shorten
                     </button>
                  </div>
               </div>

               <div class="p-4 flex-grow-1">
                  <Transition name="fade" mode="out-in">
                     <div v-if="activeView === 'upload'" key="upload">
                        <form @submit.prevent="handleUpload">
                           <div class="mb-3">
                              <div class="d-flex justify-content-between align-items-center mb-2">
                                 <label
                                    class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted mb-0">File
                                    Selection (Max 10)</label>
                                 <span class="fs-xs text-muted" v-if="fileQueue.length">{{ fileQueue.length }}/10
                                    item(s) • {{ formatBytes(totalUploadBytes) }}</span>
                              </div>

                              <div class="upload-dropzone"
                                 :class="{ 'is-dragging': isDragging, 'is-disabled': isUploading }"
                                 @click="!isUploading && triggerFileInput()"
                                 @dragover.prevent="!isUploading && (isDragging = true)"
                                 @dragleave.prevent="isDragging = false"
                                 @drop.prevent="!isUploading && handleDrop($event)">
                                 <input type="file" ref="fileInputRef" @change="handleFileChange" class="d-none"
                                    multiple :disabled="isUploading">
                                 <div class="dropzone-inner text-center">
                                    <div class="upload-icon-circle mb-2">
                                       <i class="bi bi-cloud-plus-fill"></i>
                                    </div>
                                    <h6 class="fw-bold mb-1 text-color">Drop files here or click to browse</h6>
                                    <p class="fs-xs text-muted mb-0">Supports batch files upload up to 10 files</p>
                                 </div>
                              </div>

                              <div v-if="fileQueue.length" class="mt-3">
                                 <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="fs-xs text-uppercase fw-bold text-muted">Queue List</span>
                                    <button type="button" class="btn-text-danger" @click="clearAllFiles"
                                       :disabled="isUploading">Clear queue</button>
                                 </div>
                                 <div class="file-queue-list">
                                    <div v-for="(item, index) in fileQueue" :key="`${item.file.name}-${index}`"
                                       class="file-queue-item p-2 mb-2">
                                       <div class="d-flex align-items-center justify-content-between">
                                          <div class="d-flex align-items-center gap-2 overflow-hidden me-2">
                                             <div class="file-ext-icon">
                                                <i v-if="item.status === 'done'"
                                                   class="bi bi-check-lg text-success"></i>
                                                <i v-else-if="item.status === 'error'"
                                                   class="bi bi-exclamation-triangle text-danger"></i>
                                                <i v-else class="bi bi-file-earmark-code"></i>
                                             </div>
                                             <div class="text-truncate">
                                                <div class="file-name text-truncate fs-sm fw-semibold text-color"
                                                   :title="item.file.name">{{ item.file.name }}</div>
                                                <div class="file-size text-muted fs-xs">{{ formatBytes(item.file.size)
                                                   }}</div>
                                             </div>
                                          </div>

                                          <div class="d-flex align-items-center gap-1 flex-shrink-0">
                                             <button v-if="item.status === 'done' && item.url" type="button"
                                                @click="copyItemUrl(item)" class="btn-copy-item"
                                                :class="{ 'copied': item.copyStatus === 'Copied!' }">
                                                <i
                                                   :class="item.copyStatus === 'Copied!' ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"></i>
                                                <span class="fs-xs ms-1">{{ item.copyStatus || 'Copy' }}</span>
                                             </button>

                                             <button v-if="item.status !== 'uploading'" type="button"
                                                @click.stop="removeFileAt(index)" class="btn-remove-item"
                                                title="Cancel file" :disabled="isUploading">
                                                <i class="bi bi-x-lg"></i>
                                             </button>
                                          </div>
                                       </div>

                                       <div
                                          v-if="item.status === 'uploading' || (item.progress > 0 && item.progress < 100)"
                                          class="progress custom-progress-bar-sm mt-2">
                                          <div class="progress-bar custom-bar-fill" role="progressbar"
                                             :style="{ width: `${item.progress}%` }"></div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <button type="submit"
                              class="btn btn-custom-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                              :disabled="isUploading || !hasPendingUploads">
                              <span v-if="isUploading" class="spinner-border spinner-border-sm"></span>
                              <i v-else class="bi bi-arrow-up-circle-fill"></i>
                              <span>{{ isUploading ? 'Uploading Files...' : 'Start Upload' }}</span>
                           </button>
                        </form>

                        <Alert type="danger mt-3" :show="!!uploadError">{{ uploadError }}</Alert>
                     </div>

                     <div v-else-if="activeView === 'sign'" key="sign">
                        <form @submit.prevent="handleSign">
                           <div class="mb-3">
                              <label for="targetUrlInput"
                                 class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Target Asset
                                 URL</label>
                              <input type="url" class="form-control" id="targetUrlInput" v-model="signForm.target_url"
                                 placeholder="https://example.com/asset.zip" :disabled="isSigning" required>
                           </div>
                           <div class="row g-2 mb-3">
                              <div class="col-md-12">
                                 <label for="filenameInput"
                                    class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Custom
                                    Filename (Optional)</label>
                                 <input type="text" class="form-control" id="filenameInput" v-model="signForm.filename"
                                    placeholder="download.zip" :disabled="isSigning">
                              </div>
                           </div>
                           <div class="mb-3">
                              <label for="headersInput"
                                 class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Custom
                                 Headers (JSON Optional)</label>
                              <textarea class="form-control" id="headersInput" v-model="signForm.headers" rows="2"
                                 placeholder='{"Authorization":"Bearer key"}' :disabled="isSigning"></textarea>
                           </div>
                           <button type="submit"
                              class="btn btn-custom-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                              :disabled="isSigning">
                              <span v-if="isSigning" class="spinner-border spinner-border-sm"></span>
                              <i v-else class="bi bi-shield-check"></i>
                              <span>{{ isSigning ? 'Generating...' : 'Sign URL' }}</span>
                           </button>
                        </form>

                        <div v-if="signResult" class="mt-4 pt-3 border-top">
                           <label class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Secure
                              Signed Link</label>
                           <div class="input-group mb-2">
                              <input type="text" class="form-control" :value="signResult.signed_url" readonly>
                              <button @click="copyToClipboard(signResult.signed_url)"
                                 class="btn btn-outline-secondary d-flex align-items-center gap-1" type="button"
                                 :disabled="copyButtonText === 'Copied!'">
                                 <i
                                    :class="copyButtonText === 'Copied!' ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"></i>
                                 {{ copyButtonText }}
                              </button>
                           </div>
                           <div class="d-flex align-items-center gap-3 fs-xs text-muted">
                              <span><i class="bi bi-clock me-1"></i>Expires: {{ formatDate(signResult.expires_at)
                                 }}</span>
                              <span><i class="bi bi-hdd-network me-1"></i>Limit: {{ signResult.max_size_mb }} MB</span>
                           </div>
                        </div>
                        <Alert type="danger mt-3" :show="!!signError">{{ signError }}</Alert>
                     </div>

                     <div v-else-if="activeView === 'shorten'" key="shorten">
                        <form @submit.prevent="handleShorten">
                           <div class="mb-3">
                              <label for="linkInput"
                                 class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Destination
                                 Link</label>
                              <div class="input-group">
                                 <span class="input-group-text"><i class="bi bi-link-45deg"></i></span>
                                 <input type="url" class="form-control py-2" id="linkInput" v-model="longUrl"
                                    placeholder="https://example.com/long-path-url" :disabled="isShortening" required>
                              </div>
                           </div>
                           <button type="submit"
                              class="btn btn-custom-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                              :disabled="isShortening">
                              <span v-if="isShortening" class="spinner-border spinner-border-sm"></span>
                              <i v-else class="bi bi-scissors"></i>
                              <span>{{ isShortening ? 'Shortening...' : 'Shorten URL' }}</span>
                           </button>
                        </form>

                        <div v-if="shortenResult" class="mt-4 pt-3 border-top">
                           <label class="form-label fs-xs fw-bold text-uppercase tracking-wider text-muted">Result Short
                              Link</label>
                           <div class="input-group">
                              <input type="text" class="form-control" :value="shortenResult" readonly>
                              <button @click="copyToClipboard(shortenResult)"
                                 class="btn btn-outline-secondary d-flex align-items-center gap-1" type="button"
                                 :disabled="copyButtonText === 'Copied!'">
                                 <i
                                    :class="copyButtonText === 'Copied!' ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"></i>
                                 {{ copyButtonText }}
                              </button>
                           </div>
                        </div>
                        <Alert type="danger mt-3" :show="!!shortenError">{{ shortenError }}</Alert>
                     </div>
                  </Transition>
               </div>
            </div>
         </div>

         <div class="col-lg-5">
            <Overview :stats="stats" :is-loading="isStatsLoading" @refresh="fetchStats" />
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig, useNuxtApp } from '#app'
import Overview from '@/components/Overview.vue'

const { $api } = useNuxtApp()

interface UploadItem {
   file: File
   progress: number
   status: 'idle' | 'uploading' | 'done' | 'error'
   url?: string
   error?: string
   copyStatus?: string
}

const fileQueue = ref<UploadItem[]>([])
const longUrl = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const shortenResult = ref('')
const uploadError = ref('')
const shortenError = ref('')
const signError = ref('')
const isUploading = ref(false)
const isShortening = ref(false)
const isSigning = ref(false)
const copyButtonText = ref('Copy')
const isDragging = ref(false)
const signForm = ref({ target_url: '', filename: '', headers: '' })
const signResult = ref<any | null>(null)
const activeView = ref('upload')
const isStatsLoading = ref(true)

const stats = ref({
   totalFiles: 0,
   totalSize: 0,
   totalDownloads: 0,
   apiHits: 0,
   totalShorts: 0,
   totalViews: 0,
   totalProxied: 0,
   hitsToday: 0
})

const playClickSound = () => {
   try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
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

const switchTab = (tab: string) => {
   if (isUploading.value) return
   playClickSound()
   activeView.value = tab
}

const formatBytes = (bytes: number, decimals = 2) => {
   if (!bytes || bytes === 0) return '0 Bytes'
   const k = 1024; const dm = decimals < 0 ? 0 : decimals; const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const totalUploadBytes = computed(() => fileQueue.value.reduce((total, item) => total + item.file.size, 0))
const hasPendingUploads = computed(() => fileQueue.value.some(item => item.status !== 'done'))

const addFilesToQueue = (files: File[]) => {
   if (isUploading.value) return
   if (fileQueue.value.length >= 10) {
      uploadError.value = 'Maximum limit of 10 files reached.'
      return
   }
   const remainingSlots = 10 - fileQueue.value.length
   const filesToAdd = files.slice(0, remainingSlots)
   if (files.length > remainingSlots) {
      uploadError.value = 'Maximum limit is 10 files at once.'
   } else {
      uploadError.value = ''
   }
   for (const f of filesToAdd) {
      fileQueue.value.push({
         file: f,
         progress: 0,
         status: 'idle'
      })
   }
}

const handleFileChange = (event: Event) => {
   if (isUploading.value) return
   playClickSound()
   const target = event.target as HTMLInputElement
   if (target.files?.length) {
      addFilesToQueue(Array.from(target.files))
   }
}

const handleDrop = (event: DragEvent) => {
   if (isUploading.value) return
   playClickSound()
   isDragging.value = false;
   if (event.dataTransfer?.files.length) {
      addFilesToQueue(Array.from(event.dataTransfer.files))
   }
}

const triggerFileInput = () => {
   if (isUploading.value) return
   playClickSound()
   fileInputRef.value?.click()
}

const removeFileAt = (index: number) => {
   if (isUploading.value) return
   playClickSound()
   fileQueue.value.splice(index, 1)
   uploadError.value = ''
   if (fileQueue.value.length === 0) {
      clearAllFiles()
   }
}

const clearAllFiles = () => {
   if (isUploading.value) return
   playClickSound()
   fileQueue.value = []
   uploadError.value = ''
   if (fileInputRef.value) fileInputRef.value.value = ''
}

const uploadSingleFile = (item: UploadItem) => new Promise<void>((resolve, reject) => {
   const config = useRuntimeConfig()
   const xhr = new XMLHttpRequest()
   const formData = new FormData()
   formData.append('files', item.file)

   item.status = 'uploading'
   item.progress = 0

   xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
         item.progress = Math.round((event.loaded / event.total) * 100)
      }
   }

   xhr.onload = () => {
      try {
         const response = JSON.parse(xhr.responseText)
         if (xhr.status >= 200 && xhr.status < 300 && response.status) {
            item.status = 'done'
            item.progress = 100
            const resData = Array.isArray(response.data) ? response.data[0] : response.data
            item.url = resData.url || resData
            resolve()
         } else {
            item.status = 'error'
            item.error = response.msg || response.message || 'Failed'
            reject(new Error(item.error))
         }
      } catch {
         item.status = 'error'
         item.error = 'Invalid response'
         reject(new Error(item.error))
      }
   }

   xhr.onerror = () => {
      item.status = 'error'
      item.error = 'Network error'
      reject(new Error(item.error))
   }

   xhr.open('POST', `${String(config.public.baseURL || '').replace(/\/$/, '')}/api/upload`)
   xhr.setRequestHeader('Accept', 'application/json')
   xhr.send(formData)
})

const handleUpload = async () => {
   playClickSound()
   const pendingItems = fileQueue.value.filter(item => item.status !== 'done')
   if (!pendingItems.length) return
   isUploading.value = true
   uploadError.value = ''

   try {
      await Promise.all(pendingItems.map(item => uploadSingleFile(item)))
      fetchStats()
   } catch (err: any) {
      uploadError.value = 'One or more file uploads failed.'
   } finally {
      isUploading.value = false
   }
}

const copyItemUrl = async (item: UploadItem) => {
   playClickSound()
   if (!item.url) return
   try {
      await navigator.clipboard.writeText(item.url)
      item.copyStatus = 'Copied!'
      setTimeout(() => { item.copyStatus = undefined }, 2000)
   } catch (err) {
      console.error(err)
   }
}

const fetchStats = async () => {
   playClickSound()
   isStatsLoading.value = true
   try {
      const response = await $api('/api/stats')
      if (response.status) {
         stats.value.totalFiles = response.data.total_files || 0
         stats.value.totalSize = response.data.total_files_size || 0
         stats.value.totalDownloads = response.data.total_download_size || 0
         stats.value.apiHits = response.data.total_hits || 0
         stats.value.totalShorts = response.data.total_shorts || 0
         stats.value.totalViews = response.data.total_views || 0
         stats.value.totalProxied = response.data.total_proxied || 0
         stats.value.hitsToday = response.data.hits_today || 0
      }
   } catch (error) {
      console.error("Failed to fetch stats", error)
   } finally {
      isStatsLoading.value = false
   }
}

const handleShorten = async () => {
   playClickSound()
   if (!longUrl.value) { shortenError.value = 'Please enter a URL.'; return }
   isShortening.value = true; shortenError.value = '';
   try {
      const response = await $api('/api/short', { method: 'POST', body: { url: longUrl.value } })
      if (response.status) { shortenResult.value = response.data.url; fetchStats() }
      longUrl.value = ''
   } catch (error: any) {
      shortenError.value = error.data?.msg || 'Server error.'
   } finally { isShortening.value = false }
}

const formatDate = (date: string) => date ? new Date(date).toLocaleString() : '-'

const handleSign = async () => {
   playClickSound()
   if (!signForm.value.target_url) { signError.value = 'Please enter a target URL.'; return }
   isSigning.value = true; signError.value = ''; signResult.value = null
   try {
      let headers: any = undefined
      if (signForm.value.headers.trim()) headers = JSON.parse(signForm.value.headers)
      const body: any = { target_url: signForm.value.target_url }
      if (signForm.value.filename) body.filename = signForm.value.filename
      if (headers) body.headers = headers
      const response = await $api('/api/sign', { method: 'POST', body })
      if (response.status) signResult.value = response.data
   } catch (error: any) {
      signError.value = error instanceof SyntaxError ? 'Headers must be valid JSON.' : (error.data?.msg || error.message || 'Server error.')
   } finally { isSigning.value = false }
}

const copyToClipboard = async (text: string) => {
   playClickSound()
   try {
      await navigator.clipboard.writeText(text); copyButtonText.value = 'Copied!';
      setTimeout(() => { copyButtonText.value = 'Copy' }, 2000)
   } catch (err) { console.error('Copy failed:', err); }
}

onMounted(() => {
   fetchStats()
})
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

.border-bottom,
.border-top {
   border-color: var(--app-border-color) !important;
}

.stat-card {
   display: flex;
   align-items: center;
   gap: 0.75rem;
   padding: 0.75rem 0.85rem;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.625rem;
   transition: transform 0.2s ease;
}

.stat-card:hover {
   transform: translateY(-2px);
}

.stat-icon {
   width: 38px;
   height: 38px;
   border-radius: 0.5rem;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.1rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   color: var(--app-text-color);
   flex-shrink: 0;
}

.stat-details {
   display: flex;
   flex-direction: column;
}

.stat-label {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color) !important;
   text-transform: uppercase;
   font-weight: 600;
}

.stat-value {
   font-size: 1.15rem;
   font-weight: 700;
   color: var(--app-text-color);
   margin: 0;
   line-height: 1.2;
}

.tool-center-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.625rem;
   overflow: hidden;
}

.tool-badge {
   width: 32px;
   height: 32px;
   border-radius: 0.375rem;
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
}

.tool-title {
   font-weight: 700;
   color: var(--app-text-color);
   font-size: 0.95rem;
}

.tool-subtitle {
   font-size: 0.7rem;
   color: var(--app-secondary-text-color) !important;
}

.nav-segmented {
   display: inline-flex;
   background-color: var(--app-bg);
   padding: 3px;
   border-radius: 0.5rem;
   border: 1px solid var(--app-border-color);
}

.nav-segmented-btn {
   border: none;
   background: transparent;
   color: var(--app-secondary-text-color) !important;
   padding: 0.35rem 0.85rem;
   font-size: 0.8rem;
   font-weight: 600;
   border-radius: 0.375rem;
   transition: all 0.2s ease;
}

.nav-segmented-btn:hover:not(.active):not(:disabled) {
   color: var(--app-text-color) !important;
}

.nav-segmented-btn.active {
   background-color: var(--app-accent-color);
   color: var(--app-accent-text-color) !important;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-segmented-btn:disabled {
   opacity: 0.6;
   cursor: not-allowed;
}

.upload-dropzone {
   border: 2px dashed var(--app-border-color);
   border-radius: 0.5rem;
   padding: 2rem 1.25rem;
   background-color: var(--app-bg);
   cursor: pointer;
   transition: all 0.2s ease;
}

.upload-dropzone.is-dragging,
.upload-dropzone:hover:not(.is-disabled) {
   border-color: var(--app-accent-color);
   background-color: var(--app-card-bg);
}

.upload-dropzone.is-disabled {
   opacity: 0.6;
   cursor: not-allowed;
}

.upload-icon-circle {
   width: 46px;
   height: 46px;
   margin: 0 auto;
   border-radius: 50%;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.4rem;
   color: var(--app-accent-color);
}

.file-queue-list {
   max-height: none;
   overflow: visible;
}

.file-queue-item {
   background-color: var(--app-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.375rem;
}

.file-ext-icon {
   width: 32px;
   height: 32px;
   min-width: 32px;
   min-height: 32px;
   aspect-ratio: 1 / 1;
   flex-shrink: 0;
   border-radius: 0.25rem;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--app-accent-color);
   font-size: 0.9rem;
}

.btn-remove-item {
   border: none;
   background: transparent;
   color: var(--app-secondary-text-color) !important;
   width: 24px;
   height: 24px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 0.75rem;
   transition: all 0.15s ease;
}

.btn-remove-item:hover:not(:disabled) {
   background-color: rgba(220, 53, 69, 0.2);
   color: #dc3545 !important;
}

.btn-remove-item:disabled {
   opacity: 0.5;
   cursor: not-allowed;
}

.btn-copy-item {
   border: 1px solid var(--app-border-color);
   background-color: var(--app-card-bg);
   color: var(--app-text-color);
   padding: 0.2rem 0.5rem;
   border-radius: 0.25rem;
   display: flex;
   align-items: center;
   font-size: 0.75rem;
   transition: all 0.2s ease;
}

.btn-copy-item:hover {
   border-color: var(--app-accent-color);
}

.btn-copy-item.copied {
   border-color: #198754;
   color: #198754;
}

.btn-text-danger {
   border: none;
   background: transparent;
   color: #dc3545;
   font-size: 0.75rem;
   font-weight: 600;
   padding: 0;
}

.btn-text-danger:hover:not(:disabled) {
   text-decoration: underline;
}

.btn-text-danger:disabled {
   opacity: 0.5;
   cursor: not-allowed;
}

.custom-progress-bar-sm {
   height: 4px;
   background-color: var(--app-card-bg);
   border-radius: 4px;
   overflow: hidden;
}

.custom-bar-fill {
   background-color: var(--app-accent-color);
   transition: width 0.2s ease;
}

.fade-enter-active,
.fade-leave-active {
   transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
   opacity: 0;
   transform: translateY(6px);
}
</style>