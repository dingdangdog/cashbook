<template>
  <div style="padding: 1rem">
    <div style="max-width: 20rem; margin-top: 1rem">
      <v-autocomplete
        label="开启注册功能？"
        v-model="serverInfo.openRegister"
        :items="openRegisters"
        hide-details="auto"
        variant="outlined"
      ></v-autocomplete>
    </div>
    <div
      v-if="MOD == 'LOCAL'"
      style="max-width: 30rem; margin-top: 1rem; display: flex; align-items: center"
    >
      <v-text-field
        label="数据文件夹路径"
        v-model="serverInfo.dataPath"
        hide-details="auto"
        variant="outlined"
        disabled
      ></v-text-field>
      <!-- <v-btn class="btn-group-btn" color="primary" @click="selectFloder()">修改文件夹</v-btn> -->
      <v-btn class="btn-group-btn" color="primary" @click="openFloder()">打开文件夹</v-btn>
    </div>
    <div style="margin-top: 1rem">
      <v-btn class="btn-group-btn" color="error" @click="cancel()">取消</v-btn>
      <v-btn class="btn-group-btn" color="success" @click="save()">保存</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getServerInfo, saveServerInfo } from '@/api/api.server'
import type { Server } from '@/model/server'
import { MOD } from '@/stores/flag'
import { errorAlert, successAlert } from '@/utils/alert'
import { ref } from 'vue'

const serverInfo = ref<Server>({
  openRegister: 'true'
})

const openRegisters = ref([
  { title: '关闭', value: 'false' },
  { title: '开启', value: 'true' }
])
const getConfig = () => {
  getServerInfo().then((res) => {
    serverInfo.value = res
  })
}
getConfig()
const save = () => {
  saveServerInfo(serverInfo.value)
    .then((res) => {
      successAlert('保存成功')
    })
    .catch((err) => {
      errorAlert('保存失败')
    })
}
const cancel = () => {
  getConfig()
}

const selectFloder = () => {
  // @ts-ignore
  window.electron
    .selectFolder()
    .then((path: string) => {
      serverInfo.value.dataPath = path
    })
    .catch(() => {
      errorAlert('取消修改')
    })
}

const openFloder = () => {
  // @ts-ignore
  window.electron.openFolder(serverInfo.value.dataPath)
}
</script>

<style></style>
