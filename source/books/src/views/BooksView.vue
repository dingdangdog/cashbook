<template>
  <div class="books-container">
    <BookTable />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
// 异步组件引用
const BookTable = defineAsyncComponent(() => import('@/components/table/BookTable.vue'))
</script>

<style>
.books-container {
  height: calc(100% - 4.2rem);
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
}
</style>
