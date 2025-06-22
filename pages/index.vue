<template></template>

<script setup lang="ts">
definePageMeta({
  auth: ["auth"],
});
onMounted(() => {
  navigateTo("/calendar");
});
</script>

<style scoped></style>
