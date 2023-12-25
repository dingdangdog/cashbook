<template>
  <div class="flow-container">
    <FlowTable edit="show"/>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
// 异步组件引用
const FlowTable = defineAsyncComponent(() => import('@/components/table/FlowTable.vue'))
</script>

<style>
.flow-container {
  height: calc(100% - 4.2rem);
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
}
</style>
