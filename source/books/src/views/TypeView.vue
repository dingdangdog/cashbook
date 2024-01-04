<template>
  <div class="type-container">
    <TypeTable />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
// 异步组件引用
const TypeTable = defineAsyncComponent(() => import('@/components/table/TypeTable.vue'))
</script>

<style>
.type-container {
  height: calc(100% - 4.2rem);
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
}
</style>
