<template>
  <v-dialog v-model="showSetConvertDialog" width="40rem" :fullscreen="miniFullscreen()">
    <v-card>
      <v-card-title>类型映射配置</v-card-title>
      <v-card-text class="form-inputs">
        <v-row class="form-row" v-for="(pair, index) in keyValues" :key="index">
          <v-col cols="5">
            <v-text-field
              clearable
              label="原类型"
              hide-details="auto"
              variant="underlined"
              v-model="pair.key"
              color="warning"
              :style="`color:${getItemColor(pair.value)}`"
              style="text-shadow: black 1px 1px 1px"
            ></v-text-field>
          </v-col>
          <v-col cols="5">
            <v-text-field
              clearable
              label="映射后类型"
              hide-details="auto"
              variant="underlined"
              v-model="pair.value"
              color="success"
              :style="`color:${getItemColor(pair.value)}`"
              style="text-shadow: black 1px 1px 1px"
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <div style="height: 100%; display: flex; align-items: center">
              <v-btn variant="text" color="warning" @click="removePair(index)">删除</v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <div style="text-align: center; width: 100%; margin-bottom: 1rem">
          <v-btn class="btn-group-btn" variant="elevated" color="success" @click="addPair">
            增加
          </v-btn>
          <v-btn
            class="btn-group-btn"
            variant="elevated"
            color="error"
            @click="cancelTypeRelationChange"
          >
            取消修改
          </v-btn>
          <v-btn
            class="btn-group-btn"
            variant="elevated"
            color="primary"
            @click="confirmTypeRelationChange"
          >
            保存修改
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { typeRelation } from '@/utils/store'
import { getTypeRelation, updateTypeRelation } from '@/api/api.typer'
import { errorAlert, successAlert } from '@/utils/alert'
import { showSetConvertDialog } from '@/stores/flag'
import { miniFullscreen } from '@/utils/common'

// Array to hold key-value pairs
const keyValues = ref<{ key: string; value: string }[]>([])

// Fetch and load the initial data
onMounted(() => {
  getTypeRelation().then((res) => {
    typeRelation.value = res
    const sortedEntries = Object.entries(res).sort(([, valueA], [, valueB]) =>
      valueA.localeCompare(valueB)
    ) // 对 value 进行排序

    // 将排序后的数组转换回对象
    typeRelation.value = Object.fromEntries(sortedEntries)
    keyValues.value = Object.keys(typeRelation.value).map((key) => ({ key, value: res[key] }))
  })
})

// Add a new empty key-value pair
const addPair = () => {
  keyValues.value.unshift({ key: '', value: '' })
}

// Remove a key-value pair at a specific index
const removePair = (index: number) => {
  keyValues.value.splice(index, 1)
}

// Confirm changes and update the data
const confirmTypeRelationChange = () => {
  const newRelation = keyValues.value.reduce((acc, pair) => {
    // @ts-ignore
    if (pair.key) acc[pair.key] = pair.value
    return acc
  }, {})
  updateTypeRelation(newRelation)
    .then(() => {
      successAlert('保存成功')
      typeRelation.value = newRelation
      showSetConvertDialog.value = false
    })
    .catch(() => {
      errorAlert('保存失败')
    })
}

// Cancel changes and reset to the original data
const cancelTypeRelationChange = () => {
  showSetConvertDialog.value = false
}

const colorArray = [
  '#E57373',
  '#9FA8DA',
  '#FF80AB',
  '#90CAF9',
  '#EA80FC',
  '#29B6F6',
  '#B388FF',
  '#4FC3F7',
  '#00E676',
  '#80CBC4',
  '#F57F17',
  '#1DE9B6',
  '#64DD17',
  '#78909C',
  '#BCAAA4'
] // 颜色数组
const colorMap = new Map<string, string>() // 用于存储已经分配的文本及其对应颜色
let colorIndex = 0

const getItemColor = (text: string) => {
  // 如果文本已经存在于 colorMap 中，则返回已有的颜色
  if (colorMap.has(text)) {
    return colorMap.get(text)!
  }

  // 否则，从颜色数组中获取一个颜色
  const color = colorArray[colorIndex]

  // 将文本和颜色映射存入 colorMap
  colorMap.set(text, color)

  // 更新 colorIndex，确保循环使用颜色数组
  colorIndex = (colorIndex + 1) % colorArray.length

  // 返回该文本的颜色
  return color
}
</script>
<style scoped>
.set-convert-container {
  /* min-width: 40rem; */
  margin: 0 auto;
}

.form-inputs {
  height: 35rem;
  padding: 0.5rem;
  border: solid 1px var(--v-menu-border-color);
  border-radius: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.btn-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.v-input__inner {
  width: 100%;
}
</style>
