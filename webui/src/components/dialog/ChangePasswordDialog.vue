<template>
  <div class="el-dialog-main">
    <el-form ref="dialogFormRef" :model="newPassword" :rules="rules">
      <el-form-item label="原密码" :label-width="formLabelWidth" prop="old">
        <el-input v-model="newPassword.old" type="password" show-password />
      </el-form-item>

      <el-form-item label="新密码" :label-width="formLabelWidth" prop="new">
        <el-input v-model="newPassword.new" type="password" show-password />
      </el-form-item>

      <el-form-item label="重复密码" :label-width="formLabelWidth" prop="newAgain">
        <el-input v-model="newPassword.newAgain" type="password" show-password />
      </el-form-item>
    </el-form>
  </div>
  <!-- 表单确认按钮 -->
  <footer class="custom-dialog-footer common-center">
    <span class="dialog-footer">
      <el-button type="primary" @click="confirmPasswordForm(dialogFormRef)"> 确定 </el-button>
      <el-button @click="resetPasswordForm()"> 重置 </el-button>
    </span>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

import { changePassword, checkPassword } from '@/api/api.user'
import { cleanLoginInfo } from '@/utils/common'

// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}

// 表单实例
const dialogFormRef = ref<FormInstance>()
const newPassword = ref({
  old: '',
  new: '',
  newAgain: ''
})


// 表单输入框校验规则
const rules = ref<FormRules>({
  old: [
    { required: true, message: '请输入原密码！', trigger: 'blur' }
  ],
  new: [{ required: true, message: '请输入新密码！', trigger: 'blur' }],
  newAgain: [
    { required: true, message: '请再次输入新密码！', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入新密码！'))
        } else if (value !== newPassword.value.new) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 提交表单（新增或修改）
const confirmPasswordForm = (dialogForm: FormInstance | undefined) => {
  if (!dialogForm) return
  dialogForm.validate((valid, fields) => {
    if (valid) {
      checkPassword(newPassword.value.old).then((res) => {
        if (!res) {
          ElMessage({
            type: 'error',
            message: '原密码错误！'
          })
          return
        } else {
          changePassword({ old: newPassword.value.old, new: newPassword.value.new })
            .then((res) => {
              if (res) {
                ElMessageBox.confirm('修改成功，请重新登录', '通知', {
                  confirmButtonText: '确定',
                  type: 'warning'
                }).then(() => {
                  cleanLoginInfo()
                }).catch(() => {
                  cleanLoginInfo()
                })
              } else {
                ElMessage({
                  type: 'error',
                  message: '修改失败'
                })
              }
            })
            .catch((res) => {
              console.log(res)
              ElMessage({
                type: 'error',
                message: '接口异常'
              })
            })
        }
      })
    } else {
      console.log('error submit!', fields)
    }
  })

}

// 重置表单数据
const resetPasswordForm = () => {
  newPassword.value.old = ''
  newPassword.value.new = ''
  newPassword.value.newAgain = ''
}
resetPasswordForm()
</script>

<style>
</style>
