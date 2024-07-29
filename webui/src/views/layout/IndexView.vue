<script setup lang="ts">
import { RouterView } from 'vue-router'
import MenuView from '@/views/layout/MenuView.vue'
import HeaderView from '@/views/layout/HeaderView.vue'
</script>

<template>
  <el-container style="height: calc(100vh - 2.1rem - 6px)">
    <!-- 头部-基础功能 -->
    <el-header id="main-header">
      <HeaderView />
    </el-header>
    <el-container style="max-height: calc(100% - 4rem)">
      <!-- 左侧菜单栏-路由菜单 -->
      <el-aside id="menu-aside">
        <MenuView />
      </el-aside>
      <!-- 页面主体-路由页面 -->
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
#main-header {
  height: 4rem;
  border-bottom: solid 1px var(--el-menu-border-color);
  /* height: 4rem; */
}

#menu-aside {
  width: auto;
  padding: 0.5rem;
  border-right: solid 1px var(--el-menu-border-color);
  /* box-shadow: 1rem 1rem 1rem 1rem #ffffff; */
}
</style>
