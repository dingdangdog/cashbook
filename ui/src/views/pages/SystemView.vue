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
        <v-btn type="primary" @click="setConfirm">确认设置</v-btn>
      </el-col>
      <el-col :span="1.5">
        <v-btn type="danger" @click="()=>{url = ''; changeUrl(); setConfirm()}">清除设置</v-btn>
      </el-col>
    </el-row> -->

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

onMounted(() => {

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
