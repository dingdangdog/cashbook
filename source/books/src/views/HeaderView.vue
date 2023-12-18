<template>
  <div class="header-container">
    <div class="header-left">
      <!-- 图标 -->
      <div id="iconTitle">
        <img alt="cashbook logo" src="@/assets/images/cashbook.png" width="45" />
      </div>
      <!-- 页面标题 -->
      <h3 style="padding-top: 0.3rem">Cashbook</h3>
    </div>

    <div class="header-center">
      <span>当前用户：{{ name }}&nbsp;&nbsp;</span>
      <span>当前账本：{{ bookName }}&nbsp;&nbsp;</span>
    </div>

    <div class="header-right">
      <!-- 其他按钮 -->
      <div class="header-info header-buttons">
        <!-- <el-button plain @click="showOnlineDialog()"> 在线同步 </el-button> -->
        <el-button plain @click="showPlanDialog()"> 额度设置 </el-button>
        <el-button plain @click="showBookDialog()"> 切换账本 </el-button>
      </div>

      <!-- 其他信息 -->
      <div class="header-info header-setting">
        <el-dropdown id="setting-dropdown">
          <span class="el-dropdown-link">
            <el-icon><Tools /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="changeBookKey()"> 密钥修改 </el-dropdown-item>
              <el-dropdown-item @click="logout()">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>

  <!-- 弹出框表单：账本密钥修改 -->
  <el-dialog style="width: 30vw" v-model="keyDialog.visable" :title="keyDialog.title">
    <ChangePasswordDialog />
  </el-dialog>

  <!-- 弹出框表单：额度设置 -->
  <el-dialog style="width: 30vw" v-model="planDialog.visable" :title="planDialog.title">
    <PlanDialog />
  </el-dialog>

  <!-- 弹出框：账本设置 -->
  <el-dialog style="width: 50vw" v-model="bookDialog.visable" :title="bookDialog.title">
    <BookDialog />
  </el-dialog>

  <!-- 弹出框表单：在线同步 -->
  <el-dialog style="width: 30vw" v-model="onlineDialog.visable" :title="onlineDialog.title">
    <OnlineDialog />
  </el-dialog>
</template>
<script setup lang="ts">
import { Tools } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

import BookDialog from '@/views/dialogs/BookDialog.vue'
import PlanDialog from '@/views/dialogs/PlanDialog.vue'
import OnlineDialog from '@/views/dialogs/OnlineDialog.vue'
import ChangePasswordDialog from '@/views/dialogs/ChangePasswordDialog.vue'

import { getServerInfo } from '@/api/api.server'

onMounted(() => {
  if (!localStorage.getItem('bookId')) {
    ElMessageBox.confirm('尚未打开账本，请前往选择并打开账本。', '提示', {
    confirmButtonText: '确定',
    type: 'warning'
  })
    .then(() => {
      showBookDialog()
    })
    .catch(() => {
      showBookDialog()
    })
  }
})

// 服务器信息封装
const serverInfo = ref({
  id: 1,
  version: '',
  environment: '',
  createDate: new Date(),
  startDate: new Date()
})

// 获取服务器信息
getServerInfo().then((res) => {
  serverInfo.value.id = res.id
  serverInfo.value.version = res.version || ''
  serverInfo.value.environment = res.environment || ''
  serverInfo.value.createDate = res.createDate

  localStorage.setItem('version', serverInfo.value.version)
})

// 图标大小设置
const icon = ref({
  width: 55,
  height: 55
})

if (document.body.clientWidth <= 480) {
  icon.value.width = 40
  icon.value.height = 40
}

// 用户名
const name = localStorage.getItem('name')

// 账本名
const bookName = localStorage.getItem('bookName')

const keyDialog = ref({
  visable: false,
  title: ''
})

// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}

const changeBookKey = () => {
  keyDialog.value.visable = true
  keyDialog.value.title = '修改密钥，原密钥：(' + localStorage.getItem('bookId') + ')'
}

const planDialog = ref({
  visable: false,
  title: ''
})
const showPlanDialog = () => {
  planDialog.value.visable = true
  planDialog.value.title = '额度设置'
}

const bookDialog = ref({
  visable: false,
  title: ''
})
const showBookDialog = () => {
  bookDialog.value.visable = true
  bookDialog.value.title = '账本切换'
}

const onlineDialog = ref({
  visable: false,
  title: ''
})
const showOnlineDialog = () => {
  onlineDialog.value.visable = true
  onlineDialog.value.title = '额度设置'
}

const logout = () => {
  ElMessageBox.confirm('确定退出登录？', '退出登录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      localStorage.removeItem('userId')
      localStorage.removeItem('name')
      localStorage.removeItem('bookId')
      localStorage.removeItem('bookName')
      localStorage.removeItem('token')
      location.reload()
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消退出'
      })
    })
}
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: left;
  align-items: center;
  width: 100%;
}

.header-info {
  padding: 0.5rem;
}

.header-title > h1 {
  margin-top: 1.2rem;
  margin-bottom: 0.8rem;
}

.header-left {
  width: 100%;
  display: flex;
  justify-content: left;
}
.header-center {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.header-right {
  width: 100%;
  display: flex;
  justify-content: right;
}

#theme-button {
  font-size: 1.5rem;
}

.header-setting {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 5rem;
}
#setting-dropdown {
  font-size: 1rem;
  padding: 0.5rem;
}

#iconTitle {
  padding: 0.5rem;
  float: left;
  width: auto;
}
</style>
