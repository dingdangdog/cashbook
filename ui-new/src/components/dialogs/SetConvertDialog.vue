<template>
  <v-dialog v-model="showSetConvertDialog" width="40rem" :fullscreen="DialogFullscreen">
    <v-card>
      <v-card-title>类型映射配置</v-card-title>
      <v-card-text class="form-inputs">
        <v-row class="form-row" v-for="(pair, index) in keyValues" :key="index">
          <v-col cols="5">
            <v-text-field
              clearable
              label="原类型"
              hide-details="auto"
              variant="outlined"
              v-model="pair.key"
            ></v-text-field>
          </v-col>
          <v-col cols="5">
            <v-text-field
              clearable
              label="新类型"
              hide-details="auto"
              variant="outlined"
              v-model="pair.value"
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-btn variant="text" color="error" @click="removePair(index)">删除</v-btn>
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
import { DialogFullscreen, showSetConvertDialog } from '@/stores/flag'

// Array to hold key-value pairs
const keyValues = ref<{ key: string; value: string }[]>([])

// Fetch and load the initial data
onMounted(() => {
  getTypeRelation().then((res) => {
    typeRelation.value = res
    keyValues.value = Object.keys(res).map((key) => ({ key, value: res[key] }))
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
