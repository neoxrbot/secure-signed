<template>
   <div class="container px-3 mb-5">
      <div class="profile-max-width mx-auto">
         <ProfileHeader />

         <div class="row g-4">
            <div class="col-lg-8 d-flex flex-column gap-4">
               <ProfileAbout />
               <!-- <ProfileTechStack /> -->
               <ProfileProjects />
            </div>

            <div class="col-lg-4 d-flex flex-column gap-4">
               <ProfileSocials />
               <LatestNotes domain="secure-signed.pages.dev" />
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useHead } from '#app'

useHead({ title: 'Wildan Izzudin - Developer Profile' })
</script>

<style scoped>
.profile-max-width {
   max-width: 860px;
}
</style>