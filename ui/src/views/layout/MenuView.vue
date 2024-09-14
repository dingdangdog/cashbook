<template>
  <div id="i-menu-container">
    <el-menu
      default-active="/index/calendar"
      id="i-menu"
      :collapse="isCollapse"
      @select="selectMenu"
    >
      <el-menu-item index="/index/calendar">
        <el-icon>
          <Calendar />
        </el-icon>
        <template #title>消费日历</template>
      </el-menu-item>

      <el-menu-item index="/index/analytics">
        <el-icon>
          <DataAnalysis />
        </el-icon>
        <template #title>分析概览</template>
      </el-menu-item>

      <el-menu-item index="/index/flows">
        <el-icon>
          <EditPen />
        </el-icon>
        <template #title>流水管理</template>
      </el-menu-item>

      <!-- <el-menu-item index="books">
      <el-icon><Collection /></el-icon>
      <template #title>账本管理</template>
    </el-menu-item> -->

      <!-- 多级菜单 -->
      <el-sub-menu index="/index/setting">
        <template #title>
          <el-icon>
            <Operation />
          </el-icon>
          <span>辅助功能</span>
        </template>

        <el-menu-item index="/index/books">
          <el-icon>
            <Notebook />
          </el-icon>
          <template #title>账本管理</template>
        </el-menu-item>

        <el-menu-item index="/index/type">
          <el-icon>
            <Paperclip />
          </el-icon>
          <template #title>分类管理</template>
        </el-menu-item>

        <!-- <el-menu-item index="/index/system">
          <el-icon>
            <Setting />
          </el-icon>
          <template #title>自动转换</template>
        </el-menu-item> -->
      </el-sub-menu>

      <el-divider />

      <el-menu-item index="/index/about">
        <el-icon>
          <Reading />
        </el-icon>
        <template #title>关于</template>
      </el-menu-item>
      <el-menu-item index="#1" @click="themeChange()">
        <el-icon v-show="isDark">
          <MoonNight />
        </el-icon>
        <el-icon v-show="!isDark">
          <Sunny />
        </el-icon>
        <template #title>{{ isDark ? '夜间模式' : '白天模式' }}</template>
      </el-menu-item>
    </el-menu>
    <div v-show="isCollapse" @click="isCollapse = !isCollapse" class="i-menu-collapse">
      <el-icon size="x-large"><Expand /></el-icon>
    </div>
    <div v-show="!isCollapse" @click="isCollapse = !isCollapse" class="i-menu-collapse">
      <el-icon size="x-large"><Fold /></el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter, type Router } from 'vue-router'
import {
  Calendar,
  Expand,
  Fold,
  Operation,
  Sunny,
  MoonNight,
  DataAnalysis,
  EditPen,
  Reading,
  Setting,
  Notebook,
  Paperclip
} from '@element-plus/icons-vue'
import { useToggle } from '@vueuse/shared'
import { isDark } from '@/utils/common'
import { resetFlowQuery } from '@/utils/store'

// 设置主题色
const themeChange = useToggle(isDark)

const router: Router = useRouter()
// 菜单缩放
const isCollapse = ref(false)

const selectMenu = (key: string, keyPath: string[]) => {
  console.log('selectMenu', key, keyPath)
  // 不管点的啥菜单，先充值一下查询条件吧，防止互相影响
  resetFlowQuery()
  router.push({ path: key })
}
onMounted(() => {
  router.push({ path: '/index/calendar' })
})
</script>

<style scoped>
#i-menu-container {
  position: relative;
  height: 100%;
}

#i-menu {
  overflow-y: auto;
}

.el-menu {
  border-right: none !important;
}

.i-menu-collapse {
  width: 100%;
  padding: 0.5rem 0;
  cursor: pointer;

  position: absolute;
  bottom: 0;

  display: flex;
  justify-content: center;
}

.i-menu-collapse:hover {
  background-color: var(--el-color-primary-light-7);
}
</style>
