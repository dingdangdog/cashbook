<template>
  <div class="header-container">
    <!-- 图标 -->
    <div class="header-info header-icon">
      <img
        alt="oldmoon logo"
        class="logo"
        src="../static/images/cashbook.png"
        :width="icon.width"
        :height="icon.height"
      />
    </div>

    <!-- 页面标题 -->
    <div class="header-info header-title" text-algin="center">
      <h1>CashBook</h1>
    </div>

    <!-- 其他按钮 -->
    <div class="header-info header-buttons">
      <el-button plain> 字典管理 </el-button>
      <el-button id="theme-button" plain @click="toggleDark()"
        >{{ isDark ? "☪" : "☼" }}
      </el-button>
    </div>

    <!-- 其他信息 -->
    <div class="header-info header-setting">
      <el-dropdown id="setting-dropdown">
        <span class="el-dropdown-link">
          <span v-if="haveUserIdRef()">{{ bookName }}&nbsp;&nbsp;</span><el-icon><Tools /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item  @click="clearUser()">密钥修改</el-dropdown-item>
            <el-dropdown-item  @click="clearUser()">关闭账本</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Tools } from "@element-plus/icons-vue";
import { ref } from "vue";
import { useToggle } from "@vueuse/shared";
import { clearUser } from "../utils/setKey";
import { isDark } from "../utils/store";
import { getServerInfo } from "../api/api.server";

// 图标大小设置
const icon = ref({
  width: 55,
  height: 55,
});

if (document.body.clientWidth <= 480) {
  icon.value.width = 40;
  icon.value.height = 40;
}

// 设置账本
const bookName = localStorage.getItem("bookName");
// 判断是否打开账本
const haveUserId = (): boolean => {
  if (bookName && "none" !== bookName) {
    return true;
  } else {
    return false;
  }
};
const haveUserIdRef = ref(haveUserId);

// 设置主题色
const toggleDark = useToggle(isDark);

// 服务器信息封装
const serverInfo = ref({
  id: 1,
  version: "",
  environment: "",
  createDate: new Date(),
  startDate: new Date(),
});

// 获取服务器信息
getServerInfo().then((res) => {
  serverInfo.value.id = res.id;
  serverInfo.value.version = res.version || "";
  serverInfo.value.environment = res.environment || "";
  serverInfo.value.createDate = res.createDate;

  localStorage.setItem("version", serverInfo.value.version);
});
</script>

<style scoped>
/* */

.header-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 80vw;
  height: 100%;
}

.header-info {
  padding: 0.5rem;
}

.header-title > h1 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.header-buttons {
  min-width: 360px;

  display: flex;
  justify-content: right;
  align-items: right;
}

#theme-button {
  font-size: 1.5rem;
}

.header-setting {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100px;
}
#setting-dropdown {
  font-size: 1rem;
  padding: 0.5rem;
}
</style>
