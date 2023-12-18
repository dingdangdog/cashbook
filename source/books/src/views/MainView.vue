<template>
  <RouterView />
</template>

<script setup lang="ts">
import router from '@/router';
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'

onMounted(() => {
  if (localStorage.getItem('token')) {
    router.push({ path: '/index/' })
  }
})
</script>

<style>
</style>
