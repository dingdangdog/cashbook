<template>
  <div class="dist-container">
    <DistTable />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
// 异步组件引用
const DistTable = defineAsyncComponent(
  () => import("@/components/DictTable.vue")
);
</script>

<style>
.dist-container {
  height: calc(100% - 6.2rem);
  padding: 2rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
}
</style>
