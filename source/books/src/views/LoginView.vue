<template>
  <div class="chart-container">
    <!-- set input width -->
    <el-form ref="loginForm" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="Username" prop="name" class="login-input">
        <el-input v-model="formData.userName" />
      </el-form-item>
      <el-form-item label="Password" prop="pass" class="login-input">
        <el-input v-model="formData.password" type="password" autocomplete="off" />
      </el-form-item>
      <el-checkbox v-model="remeberUser" class="login-button">remember</el-checkbox>
      <el-button type="success" class="login-button">Regiter</el-button>
      <el-button type="primary" class="login-button" @click="submitForm(loginForm)">Login</el-button>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import type { User } from '../types/model/user'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { login } from '../api/api.user'
import router from '../router/index'

const loginForm = ref<FormInstance>()
const formData = ref<User>({
  userName: '',
  password: ''
})

const remeberUser = ref(false)

const rules = reactive<FormRules<typeof formData>>({
  userName: [
    { required: true, message: 'Please input userName', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
  ]
})

const submitForm = async (form: FormInstance | undefined) => {
  if (!form) return
  await form.validate((valid, data) => {
    if (valid) {
      //alert('submit!')
      login(formData.value).then((res) => {
        if (res.id != 0) {
          ElMessage({
            type: 'success',
            message: '登录成功!'
          })
          localStorage.setItem('userId', res.id.toString());
          localStorage.setItem('token', res.token)
          // 跳转到首页
          router.push({ path: '/' })
        } else {
          ElMessage({
            type: 'error',
            message: '登录失败!'
          })
        }
      })
    } else {
      console.log('error submit!!')
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
