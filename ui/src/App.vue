<script setup lang="ts">
import { onMounted } from 'vue'
import GlobalAlert from './components/GlobalAlert.vue'
import IndexView from './views/IndexView.vue'
import { DialogFullscreen } from './stores/flag'
import { useTheme } from 'vuetify'

const theme = useTheme()
if (localStorage.getItem('theme')) {
  theme.global.name.value = String(localStorage.getItem('theme'))
}

onMounted(() => {
  if (document.body.clientWidth <= 720) {
    DialogFullscreen.value = true
  }
})
</script>

<template>
  <div class="app-container">
    <IndexView />
    <GlobalAlert />
  </div>
</template>

<style scoped></style>
