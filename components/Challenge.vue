<template>
   <div 
      class="pow-modern-box"
      :class="{ 'is-verifying': isVerifying, 'is-verified': isVerified }"
      @click="startVerification"
   >
      <div class="pow-content-left">
         <div class="pow-checkbox-wrapper">
            <div v-if="!isVerifying && !isVerified" class="pow-checkbox-idle"></div>
            
            <div v-if="isVerifying" class="pow-custom-spinner"></div>
            
            <i v-if="isVerified" class="bi bi-check-lg pow-check-icon"></i>
         </div>
         
         <div class="pow-text-group">
            <span class="pow-status-title">
               {{ statusText }}
            </span>
            <span class="pow-brand-subtitle">Neoxr Security Check</span>
         </div>
      </div>

      <div class="pow-content-right">
         <i class="bi bi-shield-lock pow-shield-logo"></i>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Interface representing the challenge data from the server
interface ChallengeData {
   salt: string
   ts: number
   difficulty: number
   token: string
   context: string
}

const props = defineProps<{
   challenge: ChallengeData | null
}>()

const emit = defineEmits(['verified'])

const isVerifying = ref(false)
const isVerified = ref(false)

// Dynamic text based on current state
const statusText = computed(() => {
   if (isVerified.value) return 'Verification complete'
   if (isVerifying.value) return 'Verifying...'
   return 'Verify you are human'
})

// Hashing utility function (SHA-256 implementation using Web Crypto API)
const sha256 = async (message: string) => {
   const msgBuffer = new TextEncoder().encode(message)
   const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
   const hashArray = Array.from(new Uint8Array(hashBuffer))
   return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Proof of Work solver
const solveChallenge = async () => {
   if (!props.challenge) return

   const { salt, ts, difficulty, context } = props.challenge
   const prefix = '0'.repeat(difficulty)
   let nonce = 0

   // Non-blocking worker loop to prevent UI freezing
   const computeBatch = async () => {
      const batchSize = 1000
      for (let i = 0; i < batchSize; i++) {
         const attempt = `${salt}:${ts}:${context}:${nonce}`
         const hash = await sha256(attempt)

         if (hash.startsWith(prefix)) {
            return nonce
         }
         nonce++
      }
      // If not found in this batch, yield to main thread and continue
      return new Promise<number>((resolve) => {
         setTimeout(() => resolve(computeBatch()), 0)
      })
   }

   const solution = await computeBatch()
   
   isVerifying.value = false
   isVerified.value = true
   emit('verified', solution)
}

const startVerification = () => {
   if (isVerified.value || isVerifying.value || !props.challenge) return

   isVerifying.value = true
   
   // Artificial delay for better UX (so the user sees the spinner briefly)
   setTimeout(() => {
      solveChallenge()
   }, 600)
}
</script>

<style scoped>
/* Core Container */
.pow-modern-box {
   --local-success: var(--app-success-color, #20c997);
   --local-border: var(--app-border-color, #2D2D2F);
   --local-card-bg: var(--app-card-bg, #1C1C1E);
   --local-text: var(--app-text-color, #FFFFFF);
   --local-text-muted: var(--app-secondary-text-color, #8A8A8E);
   --local-accent: var(--app-accent-color, #FFFFFF);

   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 1rem 1.25rem;
   background-color: var(--local-card-bg);
   border: 1px solid var(--local-border);
   border-radius: 0.75rem;
   cursor: pointer;
   user-select: none;
   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Hover effect only when idle */
.pow-modern-box:not(.is-verifying):not(.is-verified):hover {
   border-color: var(--local-accent);
   background-color: rgba(255, 255, 255, 0.02); /* Slight brightness lift */
}

/* Disabled states */
.pow-modern-box.is-verifying,
.pow-modern-box.is-verified {
   cursor: default;
}

/* Verified Box Styling */
.pow-modern-box.is-verified {
   border-color: var(--local-success);
   background-color: rgba(32, 201, 151, 0.04);
}

/* Layout Utilities */
.pow-content-left {
   display: flex;
   align-items: center;
   gap: 1rem;
}

/* Checkbox & Spinner Wrapper */
.pow-checkbox-wrapper {
   width: 28px;
   height: 28px;
   display: flex;
   align-items: center;
   justify-content: center;
   flex-shrink: 0;
}

/* Idle Checkbox */
.pow-checkbox-idle {
   width: 22px;
   height: 22px;
   border: 2px solid var(--local-border);
   border-radius: 4px;
   transition: border-color 0.2s ease;
}

.pow-modern-box:hover .pow-checkbox-idle {
   border-color: var(--local-accent);
}

/* Custom Smooth Spinner */
.pow-custom-spinner {
   width: 24px;
   height: 24px;
   border: 2px solid transparent;
   border-top-color: var(--local-accent);
   border-right-color: var(--local-accent);
   border-radius: 50%;
   animation: pow-spin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
}

@keyframes pow-spin {
   0% { transform: rotate(0deg); }
   100% { transform: rotate(360deg); }
}

/* Verified Check Icon */
.pow-check-icon {
   font-size: 1.5rem;
   color: var(--local-success);
   animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes pop-in {
   0% { opacity: 0; transform: scale(0.5); }
   100% { opacity: 1; transform: scale(1); }
}

/* Typography */
.pow-text-group {
   display: flex;
   flex-direction: column;
   justify-content: center;
}

.pow-status-title {
   font-size: 0.95rem;
   font-weight: 600;
   color: var(--local-text);
   line-height: 1.2;
   margin-bottom: 0.15rem;
   transition: color 0.3s ease;
}

.pow-modern-box.is-verified .pow-status-title {
   color: var(--local-success);
}

.pow-brand-subtitle {
   font-size: 0.75rem;
   color: var(--local-text-muted);
}

/* Right Side Logo */
.pow-shield-logo {
   font-size: 1.5rem;
   color: var(--local-border);
   transition: color 0.3s ease;
}

.pow-modern-box.is-verified .pow-shield-logo {
   color: var(--local-success);
   opacity: 0.8;
}
</style>