<template>
   <div>
      <div class="container px-3 mb-4">
         <div class="not-found-wrapper d-flex justify-content-center align-items-center">

            <div class="content-card text-center p-5 w-100 error-card">

               <div class="error-code-wrapper">
                  <h1 class="error-code">404</h1>
               </div>

               <h3 class="error-title mt-2 mb-3">Page Not Found</h3>
               <p class="error-desc mb-4 mx-auto">
                  Sorry, it looks like the page you are looking for doesn't exist, has been moved, or the URL is
                  incorrect.
               </p>

               <div class="d-flex justify-content-center gap-3 flex-wrap">
                  <button @click="goBack" class="btn btn-outline-secondary d-flex align-items-center rounded-pill px-4">
                     <i class="bi bi-arrow-left me-2"></i> Go Back
                  </button>
                  <NuxtLink to="/" class="btn btn-custom-accent d-flex align-items-center rounded-pill px-4">
                     <i class="bi bi-house-door me-2"></i> Home
                  </NuxtLink>
               </div>

            </div>

         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { useRouter } from '#app'

useHead({
   title: '404 - Page Not Found'
})

const router = useRouter()

const goBack = () => {
   router.back()
}
</script>

<style scoped>
.not-found-wrapper {
   min-height: 70vh;
}

.error-card {
   max-width: 550px;
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 1rem;
   box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}

body:not(.light-mode) .error-card {
   box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.error-code {
   font-size: 6rem;
   font-weight: 800;
   line-height: 1;
   margin: 0;
   color: transparent;
   -webkit-text-stroke: 2px var(--app-accent-color);
   background: var(--app-text-color);
   -webkit-background-clip: text;
   background-clip: text;
   letter-spacing: 5px;
}

.error-title {
   color: var(--app-text-color);
   font-weight: 700;
}

.error-desc {
   color: var(--app-secondary-text-color);
   font-size: 0.95rem;
   line-height: 1.6;
   max-width: 400px;
}

.btn-outline-secondary {
   border: 1px solid var(--app-border-color);
   transition: background-color 0.2s, color 0.2s;
}

.btn-outline-secondary:hover {
   background-color: var(--app-bg);
   color: var(--app-text-color);
   border-color: var(--app-border-color);
}

@media (max-width: 576px) {
   .error-code {
      font-size: 5rem;
   }

   .error-card {
      padding: 3rem 1.5rem !important;
   }
}
</style>