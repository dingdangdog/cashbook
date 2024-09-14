<script setup lang="ts">
import { onMounted } from 'vue'
import GlobalAlert from './components/GlobalAlert.vue'
import IndexView from './views/IndexView.vue'
import { DialogFullscreen } from './stores/flag'

onMounted(() => {
  if (document.body.clientWidth <= 720) {
    DialogFullscreen.value = true
  }
})
</script>

<template>
  <IndexView />
  <GlobalAlert />
</template>

<style scoped></style>
