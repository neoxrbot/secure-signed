<template>
   <div>
      <div class="container px-3 mb-4">
         <div class="row g-4">
            <div class="col-lg-4 d-none d-lg-block">
               <div class="docs-nav-wrapper">
                  <h6 class="docs-nav-title">ENDPOINTS</h6>
                  <ul class="list-unstyled docs-nav">
                     <li v-for="endpoint in allEndpoints" :key="endpoint.id">
                        <a :href="`#${endpoint.id}`" class="nav-link"
                           :class="{ 'active': activeSection === endpoint.id }">
                           {{ endpoint.title }}
                        </a>
                     </li>
                  </ul>
               </div>
            </div>

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

                        <h6 class="section-heading mt-4">Body Parameters</h6>
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

                        <h6 class="section-heading mt-4">Example (cURL)</h6>
                        <div class="code-container position-relative">
                           <pre><code class="language-bash">{{ endpoint.curlExample }}</code></pre>
                           <button class="btn btn-sm btn-copy"
                              @click="copyToClipboard(endpoint.curlExample, endpoint.id)">
                              <i class="bi"
                                 :class="copyStatus[endpoint.id] === 'Copied!' ? 'bi-check-lg' : 'bi-clipboard'"></i>
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-bash'
import { useHead, useRuntimeConfig } from '#app'

useHead({ title: 'API Documentation' })

const config = useRuntimeConfig()
const copyStatus = ref({})
const activeSection = ref('')
let observer = null

const copyToClipboard = (text, id) => {
   navigator.clipboard.writeText(text).then(() => {
      copyStatus.value[id] = 'Copied!'; setTimeout(() => { delete copyStatus.value[id] }, 2000)
   })
}

const endpointsData = ref([
   {
      id: 'api-upload',
      title: 'File Upload',
      method: 'POST',
      path: '/api/upload',
      description: 'Uploads one or more files and returns shareable file URLs. The request must be sent as multipart/form-data.',
      parameters: [
         { name: 'files', type: 'File[]', required: true, description: 'One or more files to be uploaded.' }
      ],
      curlTemplate: `curl -X POST "__BASE_URL__/api/upload" \\
  -F "files=@/path/to/first-file.jpg" \\
  -F "files=@/path/to/second-file.png"`
   },
   {
      id: 'api-short',
      title: 'URL Shortener',
      method: 'POST',
      path: '/api/short',
      description: 'Shortens a long URL. The request must be sent as application/json.',
      parameters: [
         { name: 'url', type: 'string', required: true, description: 'The long URL to be shortened.' }
      ],
      curlTemplate: `curl -X POST "__BASE_URL__/api/short" \\
  --header "Content-Type: application/json" \\
  --data-raw '{
    "url": "https://a-very-long-and-complex-url.com/example"
  }'`
   },
   {
      id: 'api-sign',
      title: 'Signed CDN URL',
      method: 'POST',
      path: '/api/sign',
      description: 'Creates a signed proxy/download URL for a target URL. The request must be sent as application/json.',
      parameters: [
         { name: 'target_url', type: 'string', required: true, description: 'The remote URL that should be signed.' },
         { name: 'filename', type: 'string', required: false, description: 'Optional filename used when serving the signed resource.' },
         { name: 'headers', type: 'object', required: false, description: 'Optional headers forwarded when fetching the target URL.' }
      ],
      curlTemplate: `curl -X POST "__BASE_URL__/api/sign" \\
  --header "Content-Type: application/json" \\
  --data-raw '{
    "target_url": "https://example.com/file.zip",
    "filename": "file.zip",
    "headers": {
      "Authorization": "Bearer token"
    }
  }'`
   },
   {
      id: 'api-stats',
      title: 'API Stats',
      method: 'GET',
      path: '/api/stats',
      description: 'Returns current usage counters for files, short links, proxied requests, downloads, and hits.',
      parameters: [],
      curlTemplate: `curl -X GET "__BASE_URL__/api/stats"`
   }
])

const allEndpoints = computed(() => {
   const baseUrl = process.client ? window.location.origin : (config.public.baseURL || 'https://your-domain.com');
   return endpointsData.value.map(endpoint => ({
      ...endpoint,
      curlExample: endpoint.curlTemplate.replace(/__BASE_URL__/g, baseUrl)
   }));
});

onMounted(() => {
   nextTick(() => {
      Prism.highlightAll();
      const options = { rootMargin: "-20% 0px -80% 0px" }
      observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
            if (entry.isIntersecting) {
               activeSection.value = entry.target.id
            }
         })
      }, options)
      document.querySelectorAll('.endpoint-section').forEach(section => observer.observe(section))
   })
})

onBeforeUnmount(() => {
   if (observer) observer.disconnect()
})
</script>

<style scoped>
html {
   scroll-behavior: smooth;
}

.main-title {
   font-weight: 600;
   color: var(--app-text-color);
}

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
   transition: all .2s;
   /* border-left: 2px solid transparent; */
}

.docs-nav .nav-link:hover {
   background: var(--app-bg);
   color: var(--app-text-color);
}

.docs-nav .nav-link.active {
   background: var(--app-bg);
   color: var(--app-accent-color);
   font-weight: 600;
   border-left-color: var(--app-accent-color);
}

.endpoint-section {
   margin-bottom: 2rem;
   scroll-margin-top: 100px;
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

.text-path {
   color: var(--app-text-color);
}

.section-heading {
   font-weight: 600;
   font-size: .9rem;
   color: var(--app-text-color);
   text-transform: uppercase;
   letter-spacing: .5px;
}

.table-bordered {
   --bs-table-border-color: var(--app-border-color);
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
   font-weight: 600;
}

.detail-info-table code {
   font-weight: 600;
   color: var(--app-text-color);
   background-color: var(--app-bg);
   padding: 2px 5px;
   border-radius: 4px;
}

.detail-info-table td,
.detail-info-table th {
   padding: .75rem;
   vertical-align: middle;
}

.badge.bg-danger {
   background-color: rgba(220, 53, 69, 0.15) !important;
   color: #dc3545 !important;
}

.badge.text-bg-secondary {
   background-color: rgba(var(--app-text-rgb, 255, 255, 255), 0.1) !important;
   color: var(--app-secondary-text-color) !important;
}

.code-container {
   background: #2d2d2d;
   border-radius: 6px;
   border: 1px solid var(--app-border-color);
}

.code-container pre[class*="language-"] {
   background: transparent !important;
   margin: 0;
   padding: 1rem;
   text-shadow: none;
}

.btn-copy {
   position: absolute;
   top: .5rem;
   right: .5rem;
   background: rgba(255, 255, 255, 0.1);
   color: #fff;
   border: none;
   opacity: 0;
   transition: opacity .2s;
}

.code-container:hover .btn-copy {
   opacity: 1;
}
</style>