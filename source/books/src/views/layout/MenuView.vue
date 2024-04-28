<template>
  <el-menu default-active="/index/" :collapse="isCollapse" @select="selectMenu">
    <el-menu-item index="/index/">
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

      <el-menu-item index="/index/system">
        <el-icon>
          <Setting />
        </el-icon>
        <template #title>系统设置</template>
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item index="/index/about">
      <el-icon>
        <Reading />
      </el-icon>
      <template #title>关于</template>
    </el-menu-item>
  </el-menu>

  <el-menu default-active="#" id="menu-bottom" :collapse="isCollapse" @select="selectMenu">
    <el-menu-item index="#1" @click="themeChange()">
      <el-icon v-show="isDark">
        <MoonNight />
      </el-icon>
      <el-icon v-show="!isDark">
        <Sunny />
      </el-icon>
      <template #title>{{ isDark ? '夜间模式' : '白天模式' }}</template>
    </el-menu-item>


    <el-menu-item index="#2" @click="menuChange()">
      <el-icon v-show="isCollapse" size="large">
        <Expand />
      </el-icon>
      <el-icon v-show="!isCollapse" size="large">
        <Fold />
      </el-icon>
      <template #title>{{ isCollapse ? '展开' : '收起' }}</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
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

const menuChange = () => {
  isCollapse.value = !isCollapse.value
}

const selectMenu = (key: string, keyPath: string[]) => {
  console.log('selectMenu', key, keyPath)
  // 不管点的啥菜单，先充值一下查询条件吧，防止互相影响
  resetFlowQuery()
  router.push({ path: key })
}
</script>

<style scoped>
.el-menu {
  border-right: solid 0;
}

.el-sub-menu__title span {
  margin-right: 2rem;
}

#menu-bottom {
  position: absolute;
  bottom: 1rem;
  width: auto;
}

#menu-bottom li {
  padding-right: 3rem;
}
</style>
