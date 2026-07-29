<template>
   <div class="container">
      <div class="theme-switch-container">
         <button class="theme-toggle-btn" aria-label="Toggle Theme" @click="toggleTheme">
            <i class="bi bi-moon-stars moon-icon" />
            <i class="bi bi-sun sun-icon" />
         </button>
      </div>

      <header>
         <h1>{{ error?.statusCode || 404 }} - Not Found</h1>
         <p class="subtitle">The page you are looking for does not exist</p>
      </header>

      <div class="generate-area">
         <div class="dropzone-prompt">
            <i class="bi bi-file-earmark-x generate-icon" />
            <span id="fileLabel">Oops! Access Denied or Missing</span>
            <span class="max-size-info">Make sure the URL is correct</span>
         </div>
      </div>

      <NuxtLink class="btn" to="/">Go Back Home</NuxtLink>
   </div>
</template>

<script setup>
defineProps({
   error: {
      type: Object,
      default: () => ({})
   }
})

function applySavedTheme() {
   const savedTheme = localStorage.getItem('theme')
   const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
   document.body.classList.toggle('dark', savedTheme === 'dark' || (!savedTheme && systemPrefersDark))
}

function toggleTheme() {
   document.body.classList.toggle('dark')
   const isDark = document.body.classList.contains('dark')
   localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

onMounted(() => {
   applySavedTheme()
})
</script>

<style>
.generate-area {
   border: 1.5px dashed var(--border);
   border-radius: 8px;
   padding: 2.5rem 1.5rem;
   background-color: var(--generate-bg);
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   min-height: 180px;
}

.dropzone-prompt {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   pointer-events: none;
   width: 100%;
}

.generate-icon {
   font-size: 44px;
   color: var(--error);
   margin-bottom: 1rem;
   line-height: 1;
}

#fileLabel {
   font-weight: 600;
   font-size: 0.9rem;
   margin-bottom: 0.25rem;
   color: var(--text-main);
   letter-spacing: -0.01em;
}

.max-size-info {
   font-size: 0.75rem;
   color: var(--text-muted);
   margin-top: 0.25rem;
}

.btn {
   text-decoration: none;
   display: block;
}
</style>
