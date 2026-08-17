<template>
   <div class="container px-3 mb-5">
      <div class="pin-form-card shadow-sm">
         <form @submit.prevent="login" class="pin-form-container">
            <div class="text-center mb-4">
               <div class="pin-icon-badge mb-3">
                  <i class="bi bi-shield-lock-fill"></i>
               </div>
               <h5 class="fw-bold mb-1 text-color">Security Verification</h5>
               <p class="fs-xs text-muted mb-0">Enter 6-digit administrator PIN to proceed</p>
            </div>

            <div class="pin-inputs-wrapper d-flex justify-content-center gap-2 mb-4" @paste="handlePaste">
               <input v-for="(digit, idx) in digits" :key="idx" :ref="el => pinInputs[idx] = el" v-model="digits[idx]"
                  type="password" inputmode="numeric" maxlength="1" class="form-control pin-box"
                  :class="{ 'is-filled': digits[idx] }" :disabled="loading" @input="handleInput($event, idx)"
                  @keydown="handleKeydown($event, idx)" @focus="handleFocus($event)" />
            </div>

            <button class="btn btn-custom-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
               :disabled="loading || pin.length < 6">
               <span v-if="loading" class="spinner-border spinner-border-sm"></span>
               <i v-else class="bi bi-unlock-fill"></i>
               <span>{{ loading ? 'Verifying...' : 'Unlock Workspace' }}</span>
            </button>
         </form>

         <div v-if="error" class="mt-3">
            <Alert type="danger" :show="!!error">{{ error }}</Alert>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useNuxtApp, useRouter, useState, useHead } from '#app'

useHead({ title: 'Admin Login' })

const { $api } = useNuxtApp()
const router = useRouter()
const isAdmin = useState('admin-status', () => false)

const loading = ref(false)
const error = ref('')
const digits = ref(['', '', '', '', '', ''])
const pinInputs = ref([])
const pin = computed(() => digits.value.join(''))

const playErrorSound = () => {
   try {
      const audio = new Audio('/file/CQACAgUAAxkDAAEBCjtqcT5GNMKDx_ofW7phJR9iPxSB1QACFCEAAkOViFeQof7UeGp8-D0E')
      audio.volume = 0.6
      audio.play().catch(() => { })
   } catch { }
}

const check = async () => {
   try {
      const r = await $api('/api/admin/me')
      if (r?.data?.admin) {
         isAdmin.value = true
         router.replace('/workspace')
         return
      }
   } catch { }
   nextTick(() => pinInputs.value[0]?.focus())
}

const handleInput = (e, idx) => {
   const val = e.target.value.replace(/\D/g, '')
   digits.value[idx] = val.slice(-1)
   if (val && idx < 5) {
      pinInputs.value[idx + 1]?.focus()
   }
   if (pin.value.length === 6) {
      login()
   }
}

const handleKeydown = (e, idx) => {
   if (e.key === 'Backspace' && !digits.value[idx] && idx > 0) {
      digits.value[idx - 1] = ''
      pinInputs.value[idx - 1]?.focus()
   }
}

const handleFocus = (e) => {
   e.target.select()
}

const handlePaste = (e) => {
   e.preventDefault()
   const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
   if (!pasted) return
   for (let i = 0; i < 6; i++) {
      digits.value[i] = pasted[i] || ''
   }
   const nextIdx = Math.min(pasted.length, 5)
   pinInputs.value[nextIdx]?.focus()
   if (pin.value.length === 6) {
      login()
   }
}

const login = async () => {
   if (pin.value.length < 6) return
   loading.value = true
   error.value = ''
   try {
      await $api('/api/admin/login', { method: 'POST', body: { pin: pin.value } })
      isAdmin.value = true
      router.push('/workspace')
   } catch (e) {
      playErrorSound()
      error.value = e.data?.msg || e.message || 'Incorrect PIN code'
      digits.value = ['', '', '', '', '', '']
      nextTick(() => pinInputs.value[0]?.focus())
   } finally {
      loading.value = false
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

.pin-form-card {
   width: 100%;
   max-width: 420px;
   margin: 3rem auto;
   padding: 2rem 1.75rem;
   background: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.875rem;
}

.pin-icon-badge {
   width: 52px;
   height: 52px;
   margin: 0 auto;
   border-radius: 50%;
   background: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.5rem;
   color: var(--app-accent-color);
}

.pin-box {
   width: 46px;
   height: 52px;
   text-align: center;
   font-size: 1.35rem;
   font-weight: 700;
   border-radius: 0.5rem;
   background-color: var(--app-bg) !important;
   border: 1px solid var(--app-border-color) !important;
   color: var(--app-text-color) !important;
}

.pin-box:focus,
.pin-box:hover {
   border-color: var(--app-border-color) !important;
   box-shadow: none !important;
   outline: none !important;
}

.pin-box.is-filled {
   background-color: var(--app-card-bg) !important;
   border-color: var(--app-border-color) !important;
}
</style>