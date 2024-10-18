<template>
  <v-dialog v-model="showChangePasswordDialog" transition="dialog-bottom-transition" width="30rem">
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title> 修改密码 </v-card-title>
        <v-card-text>
          <v-text-field
            label="原密码"
            autocomplete="current-password"
            placeholder="请输入原密码"
            variant="outlined"
            v-model="changPasswordData.old"
            :type="lookKey ? 'text' : 'password'"
            :readonly="loading"
            :rules="[required]"
            required
            :append-icon="lookKey ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="lookKey = !lookKey"
          ></v-text-field>
          <v-text-field
            label="新密码"
            placeholder="请输入旧密码"
            variant="outlined"
            v-model="changPasswordData.new"
            :type="lookKey ? 'text' : 'password'"
            :readonly="loading"
            :rules="[required]"
            required
            :append-icon="lookKey ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="lookKey = !lookKey"
          ></v-text-field>
          <v-text-field
            label="重复新密码"
            placeholder="请再次输入旧密码"
            variant="outlined"
            v-model="changPasswordData.againNew"
            :type="lookKey ? 'text' : 'password'"
            :readonly="loading"
            :rules="[required]"
            required
            :append-icon="lookKey ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="lookKey = !lookKey"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text="取消" @click="showChangePasswordDialog = false"></v-btn>
          <v-btn text="确定" variant="elevated" color="success" @click="submitChange"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { changePassword } from '@/api/api.user'
import type { NewPassword } from '@/model/user'
import { showChangePasswordDialog } from '@/stores/flag'
import { errorAlert, successAlert } from '@/utils/alert'
import { cleanLoginInfo } from '@/utils/common'
import { ref } from 'vue'

const loading = ref(false)
const lookKey = ref(false)
const required = (v: any) => {
  return !!v || '必填'
}

const changPasswordData = ref<NewPassword>({})
const submitChange = () => {
  if (loading.value) {
    return
  }
  if (changPasswordData.value.new != changPasswordData.value.againNew) {
    errorAlert('两次密码不一致')
    return
  }
  loading.value = true
  changePassword(changPasswordData.value)
    .then((res) => {
      if (res) {
        showChangePasswordDialog.value = false
        successAlert('密码修改成功，请重新登录！')
        cleanLoginInfo()
        // 跳转到首页
        // router.push({ path: '/' })
      } else {
        errorAlert('密码重置失败，请重试！')
      }
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped></style>
