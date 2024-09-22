<template>
  <div class="login-container">
    <div>
      <v-card-title
        class="drag-area"
        style="display: flex; border-bottom: 1px solid; padding-bottom: 0.5rem"
      >
        <div>
          <v-btn icon>
            <img src="@/assets/images/cashbook.png" height="40" alt="logo" />
          </v-btn>
          Cashbook
        </div>
        <div style="width: 100%; text-align: right">
          <v-btn class="no-drag" icon="mdi-min"></v-btn>
          <v-btn class="no-drag" icon="mdi-window-maximize"></v-btn>
          <v-btn class="no-drag" icon="mdi-close"></v-btn>
        </div>
      </v-card-title>
    </div>
    <div class="login-form">
      <!-- set input width -->
      <div class="icon-container">
        <img src="@/assets/images/cashbook.png" width="60" alt="logo" />
        <h1 style="margin: 0 0.5rem">Cashbook/Docash</h1>
      </div>
      <!-- <v-sheet rounded> -->
      <v-card class="login-card">
        <v-form v-model="form" @submit.prevent="onSubmit">
          <v-text-field
            label="账号"
            autocomplete="username"
            placeholder="请输入账号"
            v-model="signInParam.username"
            :readonly="loading"
            :rules="[required]"
            class="mb-2"
            clearable
            required
          ></v-text-field>

          <v-text-field
            label="密码"
            autocomplete="current-password"
            placeholder="请输入密码"
            v-model="signInParam.password"
            :type="lookPs ? 'text' : 'password'"
            :readonly="loading"
            :rules="[required]"
            clearable
            required
            :append-icon="lookPs ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="lookPs = !lookPs"
          ></v-text-field>

          <br />
          <v-btn
            :disabled="!form"
            :loading="loading"
            block
            color="success"
            size="large"
            type="submit"
            variant="elevated"
          >
            登录
          </v-btn>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <v-switch
              color="warning"
              v-model="themeValue"
              @update:modelValue="toggleTheme()"
              hide-details
              inset
            >
              <template v-slot:label>
                <v-icon
                  :icon="themeValue ? 'mdi-emoticon-cool-outline' : 'mdi-weather-night'"
                  :color="themeValue ? 'warning' : 'white'"
                ></v-icon>
              </template>
            </v-switch>
            <v-btn @click="resetPasswordDialog = true">忘记密码?</v-btn>
            <v-btn>注册账号</v-btn>
          </div>
        </v-form>
      </v-card>
      <v-dialog v-model="resetPasswordDialog" transition="dialog-bottom-transition" width="25rem">
        <template v-slot:default="{ isActive }">
          <v-card style="padding: 1rem">
            <v-card-title> 重置密码 </v-card-title>
            <v-text-field
              label="账号"
              autocomplete="username"
              placeholder="请输入账号"
              variant="outlined"
              v-model="resetFormData.userName"
              :readonly="loading"
              :rules="[required]"
              class="mb-2"
              clearable
              required
            ></v-text-field>

            <v-text-field
              label="服务密钥"
              autocomplete="server-key"
              placeholder="请输入服务密钥"
              variant="outlined"
              v-model="resetFormData.serverKey"
              :type="lookKey ? 'text' : 'password'"
              :readonly="loading"
              :rules="[required]"
              clearable
              required
              :append-icon="lookKey ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="lookKey = !lookKey"
            ></v-text-field>

            <v-card-actions class="justify-end">
              <v-btn text="重置" color="primary" @click="submitReset"></v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
      <!-- </v-sheet> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { login, resetPasswordApi } from '@/api/api.user'
import { errorAlert, successAlert } from '@/utils/alert'
import { useTheme } from 'vuetify'
import type { LoginParam } from '@/model/user'
import { setUserInfo } from '@/utils/common'

const theme = useTheme()
const themeValue = ref(false)
if (theme.global.name.value == 'light') {
  // console.log(theme.global.name.value)
  themeValue.value = true
}
const toggleTheme = () => {
  // console.log(themeValue.value)
  const to = theme.global.name.value == 'light' ? 'dark' : 'light'
  theme.global.name.value = to
  localStorage.setItem('theme', to)
}

const form = ref(false)
const loading = ref(false)
const lookPs = ref(false)
const lookKey = ref(false)
const signInParam = ref<LoginParam>({ username: '', password: '' })

const onSubmit = () => {
  if (!form.value) return
  loading.value = true
  login(true, signInParam.value)
    .then((res) => {
      // console.log(res)
      successAlert('Login success')
      loading.value = false
      setUserInfo(res)
    })
    .catch((err) => {
      errorAlert('Login Error:' + err.message)
    })
    .finally(() => {
      // console.log(res)
      loading.value = false
    })
}

const required = (v: any) => {
  return !!v || '必填'
}

const resetPasswordDialog = ref(false)

const resetFormData = ref({
  userName: '',
  serverKey: ''
})
const submitReset = () => {
  resetPasswordApi(resetFormData.value).then((res) => {
    if (res) {
      successAlert('密码重置成功，请登录！')
      // 跳转到首页
      // router.push({ path: '/' })
      resetPasswordDialog.value = false
      resetFormData.value.userName = ''
      resetFormData.value.serverKey = ''
    } else {
      errorAlert('密码重置失败，请重试！')
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
}
.login-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icon-container {
  margin-top: -10rem;
  margin-bottom: 1rem;
  min-width: 15rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  margin: 1rem auto !important;
  padding: 1rem;
  max-width: 30rem;
  width: 100%;
}
</style>
