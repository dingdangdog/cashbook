<template>
  <v-dialog v-model="showFlowJsonImportDialog" max-width="40rem">
    <v-card style="margin-top: -10rem">
      <v-card-title>Json导入</v-card-title>
      <v-card-text>
        <v-radio-group label="导入模式：" inline v-model="importFlag">
          <v-radio label="保留原有流水" value="add" color="success"></v-radio>
          <v-radio label="删除原有流水" value="overwrite" color="red"></v-radio>
        </v-radio-group>
        <!-- <hr /> -->
        <v-file-input
          label="选择Json文件"
          variant="outlined"
          accept=".json"
          small-chips
          hide-details="auto"
          show-size
          v-model="jsonFile"
          @update:model-value="readJsonInfo"
        ></v-file-input>
        <div style="text-align: center">
          <p v-if="jsonFlows.length > 0" style="margin: 0.5rem 0; color: #4caf50">
            共解析到{{ jsonFlows.length }}条流水数据，可以点击确认导入
          </p>
          <p v-else style="margin: 0.5rem 0; color: #ff6d00">请选择要导入的Json文件</p>
          <div>
            <span class="btn-group-btn">
              <v-btn variant="elevated" color="error" @click="showFlowJsonImportDialog = false">
                取消
              </v-btn>
            </span>
            <span class="btn-group-btn">
              <v-btn
                variant="elevated"
                color="primary"
                :disabled="!(jsonFlows.length > 0)"
                @click="submitImport"
              >
                确认导入
              </v-btn>
            </span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { importFlows } from '@/api/api.flow'
import type { Flow } from '@/model/flow'
import { showFlowJsonImportDialog } from '@/stores/flag'
import { errorAlert, successAlert, warningAlert } from '@/utils/alert'
import { ref } from 'vue'

const { successCallback } = defineProps(['successCallback'])

const bookId = localStorage.getItem('bookId')
/**
 * 文件上传相关代码
 */
const importFlag = ref('add')

const jsonFile = ref()
const jsonFlows = ref<Flow[]>([])

// 读取json文件并导入
const readJsonInfo = () => {
  console.log(jsonFile.value)
  const file = jsonFile.value
  if (!file) {
    jsonFlows.value = []
    return
  }
  // 创建FileReader对象
  const reader = new FileReader()

  // 设置文件读取完成后的回调函数
  reader.onload = (event) => {
    try {
      console.log('1234567')
      // 将读取的文本解析为JSON对象
      jsonFlows.value = JSON.parse(String(event.target?.result))
      jsonFlows.value.forEach((flow) => {
        // 数据处理
        flow.bookId = parseInt(bookId || '0')
      })
      if (jsonFlows.value.length > 0) {
        successAlert('共解析到' + jsonFlows.value.length + '条流水数据，可以点击确认导入')
      } else {
        warningAlert('未发现流水数据，请检查文件哦')
      }
    } catch (error) {
      errorAlert('文件内容好像不太对哦')
    }
  }

  // 读取文件的内容为文本
  reader.readAsText(file)
}

const submitImport = () => {
  // 调用导入接口
  importFlows(importFlag.value, jsonFlows.value)
    .then((res) => {
      console.log(res)
      if (res > 0) {
        successAlert('导入成功, 共导入' + res + '条流水')
        successCallback()
        showFlowJsonImportDialog.value = false
      } else {
        errorAlert('导入失败，请检查数据！')
      }
    })
    .catch(() => {
      errorAlert('导入失败，服务出错！')
    })
}
</script>

<style scoped></style>
