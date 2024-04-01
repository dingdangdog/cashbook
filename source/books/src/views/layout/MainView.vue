<template>
  <RouterView />
  <el-dialog v-model="showFlowTableDialog.visible" title="流水详情" width="70%" style="margin-top: 2rem !important;" :fullscreen="false">
    <FlowTable edit="hidden"/>
  </el-dialog>
</template>

<script setup lang="ts">
import router from '@/router';
import { onMounted, defineAsyncComponent } from 'vue';
import { RouterView } from 'vue-router'
import { showFlowTableDialog } from '@/stores/flag'
import { changeBackground, checkUserAndBook } from '@/utils/common'

// 异步组件引用
const FlowTable = defineAsyncComponent(() => import('@/components/table/FlowTable.vue'))

onMounted(() => {
  if (localStorage.getItem('token')) {
    router.push({ path: '/index/' })
  }
  if (localStorage.getItem("background")) {
    changeBackground(localStorage.getItem("background") || '')
  }
  // 校验数据有效性：Token、BookId
  checkUserAndBook()
})
</script>

<style>
</style>
