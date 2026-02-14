<template></template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});
onMounted(() => {
  navigateTo("/user/calendar");
});
</script>

<style scoped></style>
