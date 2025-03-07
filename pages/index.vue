<template></template>

<script setup lang="ts">
definePageMeta({
  layout: "public",
  auth: ["auth"],
});
onMounted(() => {
  navigateTo("/calendar");
});
</script>

<style scoped></style>
