<template>
  <div class="chart-container">
    <!-- set input width -->
    <el-form ref="loginForm" :model="form" label-width="120px">
      <el-form-item label="Username" prop="name" class="login-input" >
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="Password" prop="pass" class="login-input" >
        <el-input v-model="form.pass" type="password" autocomplete="off" />
      </el-form-item>
      <el-checkbox v-model="remeberUser" class="login-button">remember</el-checkbox>
      <el-button type="success"  class="login-button" @click="submitForm(loginForm)">Regiter</el-button>
      <el-button type="primary"  class="login-button">Login</el-button>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

const loginForm = ref<FormInstance>()
const form = ref({
  name: '',
  pass: ''
})

const remeberUser = ref(false)

const submitForm = (form: FormInstance) => {
  form.validate((valid) => {
    if (valid) {
      alert('submit!')
    } else {
      console.log('error submit!!')
      return false
    }
  })
}
</script>

<style scoped>
/* Your CSS code here */

.chart-container {
  padding: 2rem;
  border-radius: 10px;
  margin: 1rem;
  height: 100%;
  border: solid 1px var(--el-menu-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-input {
  width: 24rem;
  margin-left: -4rem;
}

.login-button {
  margin-left: 1rem;
  size: large;
}
</style>
