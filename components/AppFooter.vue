<template>
  <footer
    class="top-index fixed h-16 bottom-0 left-0 flex md:hidden justify-between items-center w-full border-t bg-gray-950"
  >
    <div
      class="flex-1 h-full flex items-center justify-center"
      :class="selected == 'create' ? 'bg-gray-800' : ''"
      @click="navigateTo('/cc/create')"
    >
      <span>开始创作</span>
    </div>
    <div
      class="flex-1 h-full flex items-center justify-center"
      :class="selected == 'user' ? 'bg-gray-800' : ''"
      @click="navigateTo('/user/info')"
    >
      <span>个人中心</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { selected } = defineProps(["selected"]);
</script>

<style scoped></style>
