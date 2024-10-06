<script setup lang="ts">
import { onMounted } from 'vue'
import GlobalAlert from './components/GlobalAlert.vue'
import IndexView from './views/IndexView.vue'
import { DialogFullscreen, MOD } from './stores/flag'
import { useTheme } from 'vuetify'
import { getServerInfo } from './api/api.server'

const theme = useTheme()
if (localStorage.getItem('theme')) {
  theme.global.name.value = String(localStorage.getItem('theme'))
}

onMounted(() => {
  if (document.body.clientWidth <= 720) {
    DialogFullscreen.value = true
  }

  getServerInfo().then((res) => {
    if (res) {
      localStorage.setItem('version', res.version || '')
      localStorage.setItem('mod', res.mod || '')
      localStorage.setItem('open_register', res.openRegister || '')
    }
  })
})
</script>

<template>
  <div class="app-container">
    <IndexView />
    <GlobalAlert />
  </div>
</template>

<style scoped></style>
