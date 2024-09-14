<template>
  <div class="set-convert-container">
    <div class="form-inputs">
      <el-row :gutter="24" class="form-row" v-for="(pair, index) in keyValues" :key="index">
        <el-col :span="10">
          <el-form-item label="原类型" :prop="'key' + index">
            <el-input v-model="pair.key" placeholder="Key" />
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="新类型" :prop="'value' + index">
            <el-input v-model="pair.value" placeholder="Value" />
          </el-form-item>
        </el-col>
        <el-col :span="4" class="btn-col">
          <el-button type="danger" size="mini" @click="removePair(index)">删除</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="actions">
      <el-button type="primary" @click="addPair">增加</el-button>
      <el-button type="primary" @click="confirmTypeRelationChange">保存修改</el-button>
      <el-button type="danger" @click="cancelTypeRelationChange">取消修改</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { typeRelation } from '@/utils/store'
import { getTypeRelation, updateTypeRelation } from '@/api/api.typer'

// Array to hold key-value pairs
const keyValues = ref<{ key: string; value: string }[]>([])

// Add a new empty key-value pair
const addPair = () => {
  keyValues.value.push({ key: '', value: '' })
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
      ElMessage.success('保存成功')
      typeRelation.value = newRelation
    })
    .catch(() => {
      ElMessage.error('保存失败')
    })
}

// Cancel changes and reset to the original data
const cancelTypeRelationChange = () => {
  // @ts-ignore
  const originalData = JSON.parse(typeRelation.value)
  keyValues.value = Object.keys(originalData).map((key) => ({ key, value: originalData[key] }))
}

// Fetch and load the initial data
onMounted(() => {
  getTypeRelation().then((res) => {
    typeRelation.value = res
    keyValues.value = Object.keys(res).map((key) => ({ key, value: res[key] }))
  })
})
</script>
<style scoped>
.set-convert-container {
  /* min-width: 40rem; */
  margin: 0 auto;
}

.form-inputs {
  height: 35rem;
  padding: 0.5rem;
  border: solid 1px var(--el-menu-border-color);
  border-radius: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.form-row {
  display: flex;
  align-items: center;
}

.form-row .el-col {
  margin-bottom: 0;
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

.el-input__inner {
  width: 100%;
}
</style>
