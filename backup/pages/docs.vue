<template>
   <div class="container px-3 mb-5">
      <div class="row g-4">
         <!-- LEFT NAVIGATION SIDEBAR -->
         <div class="col-lg-4 d-none d-lg-block">
            <div class="docs-nav-wrapper">
               <h6 class="docs-nav-title">ENDPOINTS</h6>
               <ul class="list-unstyled docs-nav">
                  <li v-for="endpoint in allEndpoints" :key="endpoint.id">
                     <a :href="`#${endpoint.id}`" class="nav-link" :class="{ 'active': activeSection === endpoint.id }">
                        {{ endpoint.title }}
                     </a>
                  </li>
               </ul>
            </div>
         </div>

         <!-- RIGHT CONTENT AREA -->
         <div class="col-lg-8">
            <div v-for="endpoint in allEndpoints" :key="endpoint.id" :id="endpoint.id" class="endpoint-section">
               <div class="content-card rounded-3">
                  <div class="card-body-custom">
                     <div class="d-flex align-items-center mb-3">
                        <span :class="`method-badge me-3 method-${endpoint.method.toLowerCase()}`">{{ endpoint.method
                           }}</span>
                        <code class="fs-6 fw-bold text-path">{{ endpoint.path }}</code>
                     </div>
                     <h5 class="main-title mb-1">{{ endpoint.title }}</h5>
                     <p class="endpoint-description" v-html="endpoint.description"></p>

                     <!-- PARAMETERS -->
                     <h6 class="section-heading mt-4">Parameters</h6>
                     <div class="table-responsive mb-4">
                        <table class="table detail-info-table table-bordered">
                           <thead>
                              <tr>
                                 <th>Parameter</th>
                                 <th>Type</th>
                                 <th>Status</th>
                                 <th>Description</th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr v-for="param in endpoint.parameters" :key="param.name">
                                 <td><code>{{ param.name }}</code></td>
                                 <td><code>{{ param.type }}</code></td>
                                 <td>
                                    <span v-if="param.required" class="badge bg-danger">Required</span>
                                    <span v-else class="badge text-bg-secondary">Optional</span>
                                 </td>
                                 <td v-html="param.description"></td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     <!-- CURL EXAMPLE -->
                     <h6 class="section-heading mt-4">Example Request (cURL)</h6>
                     <div class="code-container position-relative mb-4">
                        <pre><code class="language-bash">{{ endpoint.curlExample }}</code></pre>
                        <button class="btn btn-sm btn-copy" @click="copyToClipboard(endpoint.curlExample, endpoint.id)">
                           <i class="bi"
                              :class="copyStatus[endpoint.id] ? 'bi-check-lg text-success' : 'bi-clipboard'"></i>
                        </button>
                     </div>

                     <!-- JSON RESPONSE EXAMPLE -->
                     <h6 class="section-heading mt-4">Example Response (JSON)</h6>
                     <div class="code-container position-relative">
                        <pre><code class="language-json">{{ endpoint.jsonExample }}</code></pre>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeSection = ref('api-upload')
const copyStatus = ref < Record < string, boolean>> ({})

const copyToClipboard = (text: string, id: string) => {
   navigator.clipboard.writeText(text)
   copyStatus.value[id] = true
   setTimeout(() => { copyStatus.value[id] = false }, 2000)
}

const allEndpoints = computed(() => [
   {
      id: 'api-upload',
      title: 'File Upload',
      method: 'POST',
      path: '/api/upload',
      description: 'Uploads single or multiple files to the cloud storage and returns file metadata.',
      parameters: [
         { name: 'files', type: 'File', required: true, description: 'Multipart file data to be uploaded.' }
      ],
      curlExample: `curl -X POST "https://s.neoxr.eu/api/upload" \\\n  -F "files=@/path/to/file.png"`,
      jsonExample: `{
  "creator": "@securly.sign - Modern Cloud Utility",
  "status": true,
  "data": {
    "id": "BQACAgUAAxkDAALi62pqdHf7SSveSP9yFFAanLU-BictAAJcHgACz6FZV1_bX24E98h8PQQ",
    "filename": "tjNLt9nPleyq.png",
    "original_name": "file_54480.png",
    "bytes": 17065,
    "size": "16.67 KB",
    "mime": "image/png",
    "extension": "png",
    "url": "https://securly-sight.pages.dev/file/BQACAgUAAxkDAALi62pqdHf7SSveSP9yFFAanLU-BictAAJcHgACz6FZV1_bX24E98h8PQQ"
  }
}`
   },
   {
      id: 'api-short',
      title: 'URL Shortener',
      method: 'POST',
      path: '/api/short',
      description: 'Shortens a long destination URL into a compact shareable link.',
      parameters: [
         { name: 'url', type: 'string', required: true, description: 'The original long URL to shorten.' }
      ],
      curlExample: `curl -X POST "https://s.neoxr.eu/api/short" \\\n  -H "Content-Type: application/json" \\\n  -d '{"url": "https://securly-sight.pages.dev/"}'`,
      jsonExample: `{
    "creator": "@securly.sign - Modern Cloud Utility",
    "status": true,
    "data": {
        "id": "IYajnT",
        "url": "https://securly-sight.pages.dev/s/IYajnT",
        "original_url": "https://securly-sight.pages.dev/"
    }
}`
   },
   {
      id: 'api-sign',
      title: 'URL Signer / Proxy',
      method: 'POST',
      path: '/api/sign',
      description: 'Generates a signed proxy URL with optional custom headers and expiration protection.',
      parameters: [
         { name: 'target_url', type: 'string', required: true, description: 'The target media/file URL to proxy.' },
         { name: 'filename', type: 'string', required: false, description: 'Custom filename override.' },
         { name: 'headers', type: 'object', required: false, description: 'Custom JSON HTTP headers object.' }
      ],
      curlExample: `curl -X POST "https://s.neoxr.eu/api/sign" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "target_url": "https://example.com/video.mp4",\n    "filename": "video.mp4"\n  }'`,
      jsonExample: `{
    "creator": "@securly.sign - Modern Cloud Utility",
    "status": true,
    "data": {
        "token": "r0S5o62GjdrphDB5g1m8",
        "signed_url": "https://securly-sight.pages.dev/token/r0S5o62GjdrphDB5g1m8?domain=neoxr.eu",
        "expires_at": "2026-07-29T22:04:25.721Z",
        "max_size_mb": 500
    }
}`
   },
   {
      id: 'api-stats',
      title: 'Get Statistics',
      method: 'GET',
      path: '/api/stats',
      description: 'Returns total system usage statistics and metrics.',
      parameters: [],
      curlExample: `curl -X GET "https://s.neoxr.eu/api/stats"`,
      jsonExample: `{
    "creator": "@securly.sign - Modern Cloud Utility",
    "status": true,
    "data": {
        "total_files": 19,
        "total_files_size": 35344584,
        "total_shorts": 1,
        "total_views": 0,
        "total_proxied": 5,
        "total_download_size": 98128794,
        "total_hits": 21,
        "hits_today": 20
    }
}`
   }
])
</script>

<style scoped>
.content-card {
   background: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: .5rem;
}

.card-body-custom {
   padding: 1.5rem;
}

.docs-nav-wrapper {
   position: sticky;
   top: 110px;
}

.docs-nav-title {
   font-size: .75rem;
   font-weight: 700;
   text-transform: uppercase;
   letter-spacing: .5px;
   color: var(--app-secondary-text-color);
   padding: 0 .75rem;
   margin-bottom: .5rem;
}

.docs-nav .nav-link {
   padding: .5rem .75rem;
   border-radius: 6px;
   color: var(--app-secondary-text-color);
   font-weight: 500;
   font-size: 0.9rem;
}

.docs-nav .nav-link:hover,
.docs-nav .nav-link.active {
   background: var(--app-bg);
   color: var(--app-accent-color);
}

.endpoint-section {
   margin-bottom: 2rem;
}

.endpoint-description {
   color: var(--app-secondary-text-color);
   font-size: 0.9rem;
}

.method-badge {
   font-size: .7rem;
   font-weight: 700;
   padding: .2em .6em;
   border-radius: 4px;
   text-transform: uppercase;
   color: #fff;
}

.method-get {
   background: #e0b61d;
}

.method-post {
   background: #0d6efd;
}

.section-heading {
   font-weight: 600;
   font-size: .9rem;
   color: var(--app-text-color);
   text-transform: uppercase;
}

.detail-info-table {
   font-size: 0.85rem;
   --bs-table-color: var(--app-text-color);
   --bs-table-bg: var(--app-card-bg);
}

.detail-info-table thead th {
   background-color: var(--app-bg);
   color: var(--app-secondary-text-color);
   text-transform: uppercase;
   font-size: 0.75rem;
}

.code-container {
   background: #1e1e1e;
   border-radius: 6px;
   border: 1px solid var(--app-border-color);
   padding: 1rem;
}

.code-container pre {
   margin: 0;
   color: #d4d4d4;
   font-size: 0.85rem;
   font-family: monospace;
}

.btn-copy {
   position: absolute;
   top: .5rem;
   right: .5rem;
   background: rgba(255, 255, 255, 0.1);
   color: #fff;
   border: none;
}
</style>