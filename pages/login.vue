<template>
   <div class="container px-3 mb-4">
      <div class="pin-form-card">
         <form @submit.prevent="login" class="pin-form-container">
            <div class="text-center mb-4">
               <div class="pin-icon-badge mb-2">
                  <i class="bi bi-shield-lock-fill"></i>
               </div>
               <h6 class="fw-bold mb-1 text-color">Security Verification</h6>
               <p class="fs-xs text-muted mb-0">Enter your 6-digit administrator PIN</p>
            </div>

            <div class="pin-inputs-wrapper d-flex justify-content-center gap-2 mb-4" @paste="handlePaste">
               <input v-for="(digit, idx) in digits" :key="idx" :ref="el => pinInputs[idx] = el as HTMLInputElement"
                  v-model="digits[idx]" type="text" inputmode="numeric" maxlength="1" class="form-control pin-box"
                  :disabled="loading" @input="handleInput($event, idx)" @keydown="handleKeydown($event, idx)"
                  @focus="handleFocus($event)" />
            </div>

            <button class="btn btn-custom-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
               :disabled="loading || pin.length < 6">
               <span v-if="loading" class="spinner-border spinner-border-sm"></span>
               <i v-else class="bi bi-unlock-fill"></i>
               <span>{{ loading ? 'Verifying...' : 'Unlock Admin' }}</span>
            </button>
         </form>
         <Alert type="danger mt-3" :show="!!error">{{ error }}</Alert>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useNuxtApp, useRouter, useState, useHead } from '#app'

useHead({ title: 'Admin Login' })

const { $api } = useNuxtApp()
const router = useRouter()
const isAdmin = useState<boolean>('admin-status', () => false)

const loading = ref(false)
const error = ref('')
const digits = ref(['', '', '', '', '', ''])
const pinInputs = ref<HTMLInputElement[]>([])
const pin = computed(() => digits.value.join(''))

const check = async () => {
   try {
      const r: any = await $api('/api/admin/me')
      if (r?.data?.admin) {
         isAdmin.value = true
         router.replace('/workspace')
         return
      }
   } catch { }
   nextTick(() => pinInputs.value[0]?.focus())
}

const handleInput = (e: Event, idx: number) => {
   const val = (e.target as HTMLInputElement).value.replace(/\D/g, '')
   digits.value[idx] = val.slice(-1)
   if (val && idx < 5) {
      pinInputs.value[idx + 1]?.focus()
   }
   if (pin.value.length === 6) {
      login()
   }
}

const handleKeydown = (e: KeyboardEvent, idx: number) => {
   if (e.key === 'Backspace' && !digits.value[idx] && idx > 0) {
      digits.value[idx - 1] = ''
      pinInputs.value[idx - 1]?.focus()
   }
}

const handleFocus = (e: FocusEvent) => {
   (e.target as HTMLInputElement).select()
}

const handlePaste = (e: ClipboardEvent) => {
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
   } catch (e: any) {
      error.value = e.data?.message || e.message || 'Login failed'
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
   max-width: 400px;
   margin: 3rem auto;
   padding: 1.5rem;
   background: var(--app-card-bg);
   border: 1px solid var(--app-border-color);
   border-radius: 0.75rem;
}

.pin-icon-badge {
   width: 48px;
   height: 48px;
   margin: 0 auto;
   border-radius: 50%;
   background: var(--app-bg);
   border: 1px solid var(--app-border-color);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.4rem;
   color: var(--app-accent-color);
}

.pin-box {
   width: 44px;
   height: 50px;
   text-align: center;
   font-size: 1.25rem;
   font-weight: 700;
   border-radius: 0.5rem;
   background-color: var(--app-bg) !important;
   border: 1px solid var(--app-border-color) !important;
   color: var(--app-text-color) !important;
   transition: border-color 0.2s ease;
}

.pin-box:focus {
   border-color: var(--app-accent-color) !important;
}
</style>