<template>
  <div class="el-dialog-main">
    <el-form ref="onlineFormRef" :model="onlineRef" :rules="onlineFormRules">
      <el-form-item label="服务器地址" :label-width="formLabelWidth" prop="serverAddress">
        <el-input v-model="onlineRef.serverAddress" placeholder="如：http://localhost:8080" />
      </el-form-item>

      <el-form-item label="服务授权码" :label-width="formLabelWidth" prop="secret">
        <el-input v-model="onlineRef.secret" placeholder="服务器授权密钥" />
      </el-form-item>
    </el-form>
  </div>
  <!-- 表单确认按钮 -->
  <footer class="custom-dialog-footer common-center">
      <!-- <el-button type="info" @click="getSecret()">
        获取授权码
      </el-button> -->

      <el-button type="success" @click="toUpload(onlineFormRef)"> 上传 </el-button>
      <el-button type="primary" @click="toDownload(onlineFormRef)"> 下载 </el-button>
      <el-button @click="resetOnlineForm()"> 重置 </el-button>
  </footer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus';

import type { OnlineSync } from '@/types/model/online'

import { upload, download } from '@/api/api.online'

// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}

// 额度设置表单实例
const onlineFormRef = ref<FormInstance>()

const onlineModel: OnlineSync = {
  secret: window.localStorage.getItem('online-key') || undefined,
  serverAddress: window.localStorage.getItem('online-address') || undefined
}
const onlineRef = reactive(onlineModel)

// 表单输入框校验规则
const onlineFormRules = ref<FormRules>({
  secret: [{ required: true, message: '请输入授权密钥', trigger: 'blur' }],
  serverAddress: [{ required: true, message: '请输入服务器地址', trigger: 'blur' }]
})

// 重置表单数据
const resetOnlineForm = () => {
  onlineRef.secret = undefined
  onlineRef.serverAddress = undefined
}

const saveOnline = () => {
  window.localStorage.setItem('online-key', onlineModel.secret || '')
  window.localStorage.setItem('online-address', onlineModel.serverAddress || '')
}

const toUpload = async (form: FormInstance | undefined) => {
  saveOnline()
  if (!form) return
  if (
    !(await form.validate((valid, fields) => {
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
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  upload(onlineModel).then((res) => {
    if (res == 'true') {
      loading.close()
      ElMessage({
        type: 'success',
        message: '上传成功!'
      })
    } else {
      loading.close()
      console.log(res)
      if (res.code == 203) {
        if (!res.data?.auth?.state || res.data.auth.state == 0) {
          ElMessage.error('授权码无效')
        } else {
          ElMessage.error(
            '授权码剩余天数：' + (res.data.auth.limit == -1 ? '不限' : res.data.auth.limit)
          )
          ElMessage.error('授权码本日剩余次数：' + res.data.auth.day)
        }
      } else {
        ElMessage({
          type: 'error',
          message: res.message
        })
      }
    }
  })
}
const toDownload = async (form: FormInstance | undefined) => {
  saveOnline()

  if (!form) return
  if (
    !(await form.validate((valid, fields) => {
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
  ElMessageBox.confirm(
    '下载成功后将覆盖当前账本数据（流水、支付方式、消费类型、额度设置），确认下载？',
    '确认下载',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      download(onlineModel).then((res) => {
        if (res == 1) {
          loading.close()
          ElMessage({
            type: 'success',
            message: '下载成功!'
          })
          ElMessageBox.confirm(
            '下载成功，请重新登录当前账本。当前账本密码：' + window.localStorage.getItem('bookKey'),
            '下载成功',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              localStorage.removeItem('bookKey')
              localStorage.removeItem('bookName')
              location.reload()
            })
            .catch(() => {
              localStorage.removeItem('bookKey')
              localStorage.removeItem('bookName')
              location.reload()
            })
        } else {
          loading.close()
          ElMessage({
            type: 'error',
            message: res.message
          })
        }
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消下载'
      })
    })
}

</script>
<style>

</style>
