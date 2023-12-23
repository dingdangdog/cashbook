<template>
  <div class="setting-container">
    <div class="background-set">
      <el-form-item label="图片地址">
        <el-input v-model="url" placeholder="Please input" @input="changeBackground" />
      </el-form-item>
      <el-form-item label="图片预览">
        <el-image style="width: 300px; height: 300px" :src="url" fit="contain" />
      </el-form-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const url = ref('')

const changeBackground = () => {
  document.getElementById('app')!.style!.backgroundImage = 'url(' + url.value + ')'
  // set div background image size
  document.getElementById('app')!.style!.backgroundSize = 'cover'
}
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
