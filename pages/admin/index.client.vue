<script setup lang="ts">
// 需要登录
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});
</script>

<template>
  <div class="tw-text-xl tw-p-4">
    欢迎使用 {{ SystemConfig?.title }} 管理后台
  </div>
</template>

<style scoped></style>
