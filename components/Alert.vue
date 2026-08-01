<template>
   <div class="alert" :class="alertClass" role="alert" v-if="show">
      <slot>A default alert message.</slot>
   </div>
</template>

<script setup>
const props = defineProps({
   type: {
      type: String,
      default: 'info',
      validator: (val) =>
         ['info', 'danger', 'success', 'warning'].includes(val),
   },
   show: {
      type: Boolean,
      default: true,
   },
})

const alertClass = computed(() => `alert-${props.type} mt-3`)
</script>