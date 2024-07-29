<template>
  <div style="">
    <div class="window-title">
      <div class="window-title-text">
        <img style="height: 1.5rem; margin: 0.2rem" src="@/assets/icon.ico" fit="cover" />
        <el-text style="color: white; font-weight: bold">CashBook</el-text>
      </div>
      <div class="window-title-buttons">
        <div class="button" @click="minimize">
          <img src="@/assets/minus.svg" class="button-svg" />
        </div>
        <div class="button" @click="maximize">
          <img src="@/assets/window-maximize.svg" class="button-svg" />
        </div>
        <div class="button" @click="close">
          <img src="@/assets/window-close.svg" class="button-svg" />
        </div>
      </div>
    </div>
    <RouterView />
  </div>
  <el-dialog
    v-model="showFlowTableDialog.visible"
    title="流水详情"
    width="70%"
    style="margin-top: 2rem !important"
    :fullscreen="false"
  >
    <FlowTable edit="hidden" />
  </el-dialog>
</template>

<script setup lang="ts">
import router from '@/router'
import { onMounted, defineAsyncComponent } from 'vue'
import { RouterView } from 'vue-router'
import { showFlowTableDialog } from '@/stores/flag'
import { changeBackground, checkUserAndBook } from '@/utils/common'

// 异步组件引用
const FlowTable = defineAsyncComponent(() => import('@/components/table/FlowTable.vue'))

const minimize = () => {
  window.electron.minimize()
}

const maximize = () => {
  window.electron.maximize()
}

const close = () => {
  if (!localStorage.getItem("remember")){
    localStorage.clear()
  }
  window.electron.close()
}

onMounted(() => {
  if (localStorage.getItem('token')) {
    router.push({ path: '/index/calendar' })
  }
  if (localStorage.getItem('background')) {
    changeBackground(localStorage.getItem('background') || '')
  }
  // 校验数据有效性：Token、BookId
  checkUserAndBook()
})
</script>

<style scoped>
.window-title {
  background-color: rgb(40, 138, 60);
  height: 2rem;
  border-bottom: solid 1px var(--el-menu-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
}
.window-title-text {
  display: flex;
  color: white;
}
.window-title-buttons {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  justify-content: flex-end;
}
.button {
  height: 2rem;
  width: 2rem;
  border-radius: 0.5rem;
  -webkit-app-region: no-drag; /* 按钮不可拖动 */
  display: flex;
  justify-content: center;
  align-items: center;
}
.button:hover {
  background-color: #4f4f4f;
}

.button-svg {
  width: 1.5rem;
}
</style>
