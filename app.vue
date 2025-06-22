<script setup>
// 全局主题初始化
const { initTheme } = useAppTheme();

// 在应用启动时立即初始化主题
onMounted(() => {
  initTheme();
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
