<template>
  <div class="chart-container">
    <!-- set input width -->
    <el-form ref="loginForm" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="UserName" prop="name" class="login-input">
        <el-input v-model="formData.userName" />
      </el-form-item>
      <el-form-item label="Password" prop="pass" class="login-input">
        <el-input v-model="formData.password" type="password" autocomplete="off" />
      </el-form-item>
      <el-checkbox v-model="remeberUser" class="login-button">Remember me</el-checkbox>
      <el-button type="success" class="login-button" @click="toRegister">Regiter</el-button>
      <el-button type="primary" class="login-button" @click="submitForm(loginForm)">Login</el-button>
    </el-form>
  </div>

  <!-- 弹出框表单：注册用户 -->
  <el-dialog style="width: 30vw" v-model="registerDialog.visable" :title="registerDialog.title">
    <div class="el-dialog-main">
      <el-form ref="registerFormRef" :model="registerUser" :rules="registerUserRules">
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="name">
          <el-input v-model="registerUser.name" :min="0" />
        </el-form-item>

        <el-form-item label="密码（UserName）" :label-width="formLabelWidth" prop="userName">
          <el-input v-model="registerUser.userName" :min="0" />
        </el-form-item>

        <el-form-item label="密码（Password）" :label-width="formLabelWidth" prop="password">
          <el-input v-model="registerUser.password" :min="0" />
        </el-form-item>
      </el-form>
    </div>
    <!-- 表单确认按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="register(registerFormRef)"> 确定 </el-button>
        <el-button @click="cancel()"> 取消 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import type { User } from '../types/model/user'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { login, registerApi } from '../api/api.user'
import router from '../router/index'

// 表单输入框宽度
const formLabelWidth = ref('150px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '100px'
}

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
          localStorage.setItem('userId', res.id.toString())
          localStorage.setItem('name', res.name)
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

const registerDialog = ref({
  visable: false,
  title: '注册用户'
})

const registerUser = ref<User>({
  name: '',
  userName: '',
  password: ''
})

// 表单输入框校验规则
const registerUserRules = ref<FormRules>({
  name: [
    { required: true, message: '请选择用户名', trigger: 'blur' },
    { min: 1, max: 24, message: '字符限制：1-24', trigger: 'blur' }
  ],
  userName: [
    { required: true, message: '请输入登录名', trigger: 'blur' },
    { min: 6, max: 18, message: '字符限制：6-18', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 18, message: '字符限制：6-18', trigger: 'blur' }
  ]
})

const registerFormRef = ref<FormInstance>()

const toRegister = () => {
  registerDialog.value.visable = true
}

const register = (form: FormInstance | undefined) => {
  if (!form) return
  form.validate((valid, data) => {
    if (valid) {
      //alert('submit!')
      registerApi(registerUser.value).then((res) => {
        if (res != 0) {
          ElMessage({
            type: 'success',
            message: '注册成功，请登录!'
          })
          // 跳转到首页
          // router.push({ path: '/' })
          registerDialog.value.visable = false
        } else {
          ElMessage({
            type: 'error',
            message: '注册失败，请重试!'
          })
        }
      })
    } else {
      console.log('error submit!!')
    }
  })
}

const cancel = () => {
  registerDialog.value.visable = false
}
</script>

<style scoped>
/* Your CSS code here */

.chart-container {
  padding: 2rem;
  border-radius: 10px;
  margin: 1rem;
  height: 90vh;
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
