<template>
  <div class="pa-4">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1>Toast 消息通知测试页面</h1>
          <p>点击下面的按钮测试不同类型的toast消息</p>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12" md="6">
          <h3>使用 Alert 类（原有方式）</h3>
          <v-btn 
            @click="testAlertSuccess" 
            color="success" 
            class="ma-2"
          >
            成功消息
          </v-btn>
          
          <v-btn 
            @click="testAlertError" 
            color="error" 
            class="ma-2"
          >
            错误消息
          </v-btn>
          
          <v-btn 
            @click="testAlertWarning" 
            color="warning" 
            class="ma-2"
          >
            警告消息
          </v-btn>
          
          <v-btn 
            @click="testAlertInfo" 
            color="info" 
            class="ma-2"
          >
            信息消息
          </v-btn>
        </v-col>
        
        <v-col cols="12" md="6">
          <h3>使用 useAppToast（新方式）</h3>
          <v-btn 
            @click="testToastSuccess" 
            color="success" 
            class="ma-2"
          >
            成功消息
          </v-btn>
          
          <v-btn 
            @click="testToastError" 
            color="error" 
            class="ma-2"
          >
            错误消息
          </v-btn>
          
          <v-btn 
            @click="testToastWarning" 
            color="warning" 
            class="ma-2"
          >
            警告消息
          </v-btn>
          
          <v-btn 
            @click="testToastInfo" 
            color="info" 
            class="ma-2"
          >
            信息消息
          </v-btn>
          
          <v-btn 
            @click="clearAllToasts" 
            color="secondary" 
            class="ma-2"
          >
            清除所有消息
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { Alert } from "~/utils/alert"
import { useAppToast } from "~/utils/toast"

const toast = useAppToast()

// 使用 Alert 类测试
const testAlertSuccess = () => {
  Alert.success("Alert 类 - 操作成功！")
}

const testAlertError = () => {
  Alert.error("Alert 类 - 操作失败！")
}

const testAlertWarning = () => {
  Alert.warning("Alert 类 - 请注意！")
}

const testAlertInfo = () => {
  Alert.info("Alert 类 - 信息提示")
}

// 使用 useAppToast 测试
const testToastSuccess = () => {
  toast.success("useAppToast - 操作成功！")
}

const testToastError = () => {
  toast.error("useAppToast - 操作失败！", {
    timeout: 5000 // 自定义显示时间
  })
}

const testToastWarning = () => {
  toast.warning("useAppToast - 请注意！")
}

const testToastInfo = () => {
  toast.info("useAppToast - 信息提示")
}

const clearAllToasts = () => {
  toast.clear()
}
</script> 