<template></template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});
onMounted(() => {
  navigateTo("/user/jimi");
});
</script>

<style scoped></style>
