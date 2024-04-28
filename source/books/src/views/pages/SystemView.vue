<template>
  <div class="setting-container">
    <!-- <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="图片地址">
          <el-input v-model="url" placeholder="Please input" @input="changeUrl" />
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-form-item label="图片预览">
          <el-image style="width: auto; height: 5rem"
                    :src="url"
                    :zoom-rate="1.2"
                    :max-scale="7"
                    :min-scale="0.2"
                    :preview-src-list="[url]"
                    fit="contain" >
            <template #error>
              <div class="image-slot">
                请输入图片地址
              </div>
            </template>
          </el-image>
        </el-form-item>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" @click="setConfirm">确认设置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" @click="()=>{url = ''; changeUrl(); setConfirm()}">清除设置</el-button>
      </el-col>
    </el-row> -->
    
    <el-row :gutter="24">
      <el-col :span="8">
        <el-form-item label="数据分类映射关系" prop="jsonRelation">
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 18 }" v-model="jsonRelation" placeholder="Please input" @input="changeUrl" />
        </el-form-item>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" @click="confirmTypeRelationChange()">保存修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" @click="cancelTypeRelationChange()">取消修改</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { setBackground } from '@/api/api.user'
import { changeBackground } from '@/utils/common'
import { ElMessage } from 'element-plus'
import { typeRelation } from '@/utils/store';
import { getTypeRelation, updateTypeRelation } from '@/api/api.typer';

const url = ref('')

const changeUrl = () => {
  changeBackground(url.value)
}

const setConfirm = () => {
  setBackground(url.value).then((res)=>{
    if (res) {
      ElMessage.success("设置成功")
    } else {
      ElMessage.success("设置失败")
    }
  }).catch(()=>{
    ElMessage.success("设置失败")
  })
}

const jsonRelation = ref('')

const confirmTypeRelationChange = () => {
  let newRelation = JSON.parse(jsonRelation.value);
  updateTypeRelation(newRelation).then(()=>{
    ElMessage.success("保存成功");
    typeRelation.value = newRelation;
  }).catch(()=>{
    ElMessage.success("保存失败");
  })
}

const cancelTypeRelationChange = () => {
  jsonRelation.value = JSON.stringify(typeRelation.value, null, 2)
}

onMounted(() => {
  getTypeRelation().then(res => {
    typeRelation.value = res
    jsonRelation.value = JSON.stringify(typeRelation.value, null, 2)
  })
})
</script>

<style>
.setting-container {
  height: calc(100% - 4.2rem);
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
}
</style>
