<template>
   <div class="content-card p-4 rounded-3">
      <h6 class="fw-bold text-color mb-3 d-flex align-items-center gap-2">
         <i class="bi bi-person-lines-fill text-accent"></i>
         <span>About</span>
      </h6>
      <p class="fs-sm text-muted mb-3">
         Welcome to my developer ecosystem, a self-built infrastructure that brings web applications, WhatsApp bots,
         and gateway services together under one unified platform.
      </p>
      <p class="fs-sm text-muted mb-0">
         Built from the ground up, the ecosystem is designed for seamless integration between web and bot services,
         enabling automation, real-time communication, and scalable service management through a lightweight and highly
         responsive architecture.
      </p>
   </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.fs-sm {
   font-size: 0.875rem;
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

.content-card {
   background-color: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.75rem;
   overflow: hidden;
}
</style>