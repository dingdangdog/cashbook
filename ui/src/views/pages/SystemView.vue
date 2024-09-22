<template>
  <div style="padding: 1rem">
    <div style="max-width: 20rem">
      <v-autocomplete
        label="开启注册功能？"
        v-model="serverInfo.openRegister"
        :items="openRegisters"
        hide-details="auto"
        variant="outlined"
      ></v-autocomplete>
    </div>
    <div style="margin-top: 1rem">
      <v-btn class="btn-group-btn" color="success" @click="save">保存</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getServerInfo, saveServerInfo } from '@/api/api.server'
import type { Server } from '@/model/server'
import { successAlert } from '@/utils/alert'
import { ref } from 'vue'

const serverInfo = ref<Server>({
  openRegister: 'true'
})

const openRegisters = ref([
  { title: '关闭', value: 'false' },
  { title: '开启', value: 'true' }
])

getServerInfo().then((res) => {
  serverInfo.value = res
})

const save = () => {
  saveServerInfo(serverInfo.value).then((res) => {
    successAlert('保存成功')
  })
}
</script>

<style></style>
