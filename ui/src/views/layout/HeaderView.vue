<template>
  <div class="header-container">
    <div class="header-left mini-hidden">
      <!-- 页面标题 -->
      <!-- <h3 style="padding-top: 0.3rem">Thanks for you Uesd</h3> -->
      <div id="iconTitle">
       <img alt="cashbook logo" src="@/assets/images/cashbook.png" style="width: 2.8rem" />
     </div>
    </div>

    <div class="header-center">
      <span>当前用户：{{ name }}&nbsp;&nbsp;</span>
      <span>当前账本：{{ bookName }}&nbsp;&nbsp;</span>
    </div>

    <div class="header-right mini-hidden">
      <!-- 其他按钮 -->
      <div class="header-info header-buttons">
        <!-- <el-button plain @click="showOnlineDialog()"> 在线同步 </el-button> -->
        <el-button plain @click="showSetConvertDialog()"> 分类映射 </el-button>
        <el-button plain @click="showPlanDialog()"> 额度设置 </el-button>
        <el-button plain @click="showBookDialog()"> 切换账本 </el-button>
      </div>
    </div>
    <div>
      <!-- 其他信息 -->
      <div class="header-info header-setting">
        <el-dropdown id="setting-dropdown">
          <span class="el-dropdown-link">
            <el-icon><Tools /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item class="max-hidden" @click="showSetConvertDialog()">
                分类映射
              </el-dropdown-item>
              <el-dropdown-item class="max-hidden" @click="showPlanDialog()">
                额度设置
              </el-dropdown-item>
              <el-dropdown-item class="max-hidden" @click="showBookDialog()">
                切换账本
              </el-dropdown-item>
              <el-dropdown-item @click="changePassword()"> 修改密码 </el-dropdown-item>
              <el-dropdown-item @click="logout()">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>

  <!-- 弹出框表单：类型转换配置 -->
  <el-dialog
    style="width: 30rem"
    v-model="setConvertDialog.visible"
    :title="setConvertDialog.title"
  >
    <SetConvertDialog />
  </el-dialog>

  <!-- 弹出框表单：账本密钥修改 -->
  <el-dialog style="width: 30rem" v-model="passwordDialog.visible" :title="passwordDialog.title">
    <ChangePasswordDialog />
  </el-dialog>

  <!-- 弹出框表单：额度设置 -->
  <el-dialog style="width: 30rem" v-model="planDialog.visible" :title="planDialog.title">
    <PlanDialog />
  </el-dialog>

  <!-- 弹出框：账本设置 -->
  <el-dialog
    style="width: 30rem"
    v-model="showBookDialogFlag.visible"
    :title="bookDialog.title"
    @close="checkBook"
    destroy-on-close
  >
    <BookDialog />
  </el-dialog>

  <!-- 弹出框表单：在线同步 -->
  <el-dialog style="width: 30rem" v-model="onlineDialog.visable" :title="onlineDialog.title">
    <OnlineDialog />
  </el-dialog>
</template>
<script setup lang="ts">
import { Tools } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

import { showBookDialogFlag } from '@/stores/flag'

import BookDialog from '@/components/dialog/BookDialog.vue'
import PlanDialog from '@/components/dialog/PlanDialog.vue'
import OnlineDialog from '@/components/dialog/OnlineDialog.vue'
import SetConvertDialog from '@/components/dialog/SetConvertDialog.vue'
import ChangePasswordDialog from '@/components/dialog/ChangePasswordDialog.vue'

import { getServerInfo } from '@/api/api.server'

import { cleanLoginInfo } from '@/utils/common'

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

  setInterval(() => {
    name.value = localStorage.getItem('name') || ''
    bookName.value = localStorage.getItem('bookName') || ''
  }, 500)
})

const checkBook = () => {
  if (!localStorage.getItem('bookId')) {
    ElMessage.error('请先选择账本！')
    setTimeout(() => {
      showBookDialog()
    }, 500)
  }
}

// 获取服务器信息
getServerInfo().then((res) => {
  console.log(res, 'version')
  localStorage.setItem('version', res.version || "")
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
const name = ref(localStorage.getItem('name') || '')

// 账本名
const bookName = ref(localStorage.getItem('bookName') || '')

const passwordDialog = ref({
  visible: false,
  title: ''
})

// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}

const changePassword = () => {
  passwordDialog.value.visible = true
  passwordDialog.value.title = '修改密码'
}

const planDialog = ref({
  visible: false,
  title: ''
})
const showPlanDialog = () => {
  planDialog.value.visible = true
  planDialog.value.title = '额度设置'
}

const bookDialog = ref({
  visible: showBookDialogFlag.value.visible,
  title: '切换账本'
})
const showBookDialog = () => {
  showBookDialogFlag.value.visible = true
}

const onlineDialog = ref({
  visable: false,
  title: ''
})
const showOnlineDialog = () => {
  onlineDialog.value.visable = true
  onlineDialog.value.title = '额度设置'
}

const setConvertDialog = ref({
  visible: false,
  title: ''
})
const showSetConvertDialog = () => {
  setConvertDialog.value.visible = true
  setConvertDialog.value.title = '分类映射配置'
}

const logout = () => {
  ElMessageBox.confirm('确定退出登录？', '退出登录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      cleanLoginInfo()
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
  justify-content: space-between;
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
  align-items: center;
}
.header-center {
  /* flex: 2; */
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.header-right {
  width: 100%;
  display: flex;
  justify-content: right;
  align-items: center;
}

.header-setting {
  display: flex;
  justify-content: center;
  align-items: center;
  /* min-width: 5rem; */
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

@media screen and (max-width: 1280px) {
  .mini-hidden {
    display: none;
  }
  .max-hidden {
    display: show;
  }
}
.max-hidden {
  display: none;
}
</style>
