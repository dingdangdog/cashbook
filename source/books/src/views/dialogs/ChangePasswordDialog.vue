<template>
  <div class="el-dialog-main">
    <el-form ref="dialgoFormRef" :model="newKey" :rules="rules">
      <el-form-item label="新密钥" :label-width="formLabelWidth" prop="key">
        <el-input v-model="newKey.key" />
      </el-form-item>

      <el-form-item label="重复密钥" :label-width="formLabelWidth" prop="keyAgain">
        <el-input v-model="newKey.keyAgain" />
      </el-form-item>
    </el-form>
  </div>
  <!-- 表单确认按钮 -->
  <footer class="custom-dialog-footer common-center">
    <span class="dialog-footer">
      <el-button type="primary" @click="confirmKeyForm(dialgoFormRef)"> 确定 </el-button>
      <el-button @click="resetKeyForm()"> 重置 </el-button>
    </span>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus';

import type { Book } from '@/types/model/book'

import { changeKey } from '@/api/api.book'

// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}

// 表单实例
const dialgoFormRef = ref<FormInstance>()
const newKey = ref({
  key: '',
  keyAgain: ''
})

var book: Book = {
  id: 0,
  bookName: localStorage.getItem('bookName') || '',
  createDate: ''
}

// 表单输入框校验规则
const rules = ref<FormRules>({
  key: [{ required: true, message: '请输入新密钥！', trigger: 'blur' }],
  keyAgain: [
    { required: true, message: '请再次输入新密钥！', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入新密钥！'))
        } else if (value !== newKey.value.key) {
          callback(new Error('两次输入密钥不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 提交表单（新增或修改）
const confirmKeyForm = async (dialgoForm: FormInstance | undefined) => {
  if (!dialgoForm) return
  if (
    !(await dialgoForm.validate((valid, fields) => {
      if (valid) {
        console.log('submit!')
      } else {
        console.log('error submit!', fields)
        return false
      }
    }))
  ) {
    return
  }
  book.bookName = newKey.value.key
  changeKey(book)
    .then((res) => {
      ElMessageBox.confirm('修改成功，新密钥(' + res.bookName + ')，请重新登录', '通知', {
        confirmButtonText: '确定',
        type: 'warning'
      })
        .then(() => {
          localStorage.removeItem('bookId')
          localStorage.removeItem('bookName')
          location.reload()
        })
        .catch(() => {
          localStorage.removeItem('bookId')
          localStorage.removeItem('bookName')
          location.reload()
        })
    })
    .catch((res) => {
      ElMessage({
        type: "error",
        message: res,
      });
    })

}

// 重置表单数据
const resetKeyForm = () => {
  newKey.value.key = ''
  newKey.value.keyAgain = ''
}
</script>

<style>
</style>
