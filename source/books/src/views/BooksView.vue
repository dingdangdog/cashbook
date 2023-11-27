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
  height: calc(100% - 6.2rem);
  padding: 2rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
}
</style>
