<script setup lang="ts">
import { ref, watch } from 'vue'
import { type AlertInfo, newAlert } from '@/utils/alert'

// 定义 Map，存储Alert信息集合，使用Map便于删除
const alertMap = ref<Map<string, AlertInfo>>(new Map())

// 监听新Alert创建
watch(newAlert.value, () => {
  alertMap.value.set(newAlert.value.id, { ...newAlert.value })
  deleteAlert(newAlert.value.id)
})

const deleteAlert = (id: string) => {
  // console.log(id)
  setTimeout(() => {
    alertMap.value.delete(id)
  }, 3000)
}
</script>

<template>
  <div class="alert-container" style="z-index: 99999">
    <v-alert
      class="v-alert"
      v-for="(alert, index) in Array.from(alertMap.values())"
      :key="index"
      :type="alert.type"
      :border="'start'"
      closable
      close-label="Close Alert"
      :text="alert.message"
    >
    </v-alert>
  </div>
</template>

<style scoped>
.alert-container {
  position: absolute;
  top: 5rem;
  right: 0;
}

.v-alert {
  margin-top: 0.2rem !important;
}
</style>
