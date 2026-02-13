<script setup lang="ts">
// 需要登录
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-8rem)]">
    <div
      class="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700 w-full h-full mx-4"
    >
      <div class="text-center">
        <!-- 欢迎图标 -->
        <div class="mb-6">
          <div
            class="w-20 h-20 pl-2 pt-1 bg-green-200 rounded-full flex items-center justify-center mx-auto"
          >
            <img src="/logo.webp" class="w-16 h-16" />
          </div>
        </div>

        <!-- 欢迎文字 -->
        <h1 class="text-2xl font-bold text-white mb-8">
          欢迎使用{{ SystemConfig?.title }}管理后台
        </h1>

        <!-- 功能卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div
            class="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-700"
            @click="navigateTo('/admin/users')"
          >
            <div class="text-blue-400 text-lg font-medium">用户管理</div>
            <div class="text-gray-400 text-xs mt-1">管理系统用户</div>
          </div>
          <div
            class="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-700"
            @click="navigateTo('/admin/books')"
          >
            <div class="text-green-400 text-lg font-medium">账本管理</div>
            <div class="text-gray-400 text-xs mt-1">管理用户账本</div>
          </div>
          <div
            class="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-700"
            @click="navigateTo('/admin/typeRelations')"
          >
            <div class="text-purple-400 text-lg font-medium">映射管理</div>
            <div class="text-gray-400 text-xs mt-1">CSV导入映射管理</div>
          </div>
          <div
            class="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-700"
            @click="navigateTo('/admin/themes')"
          >
            <div class="text-emerald-400 text-lg font-medium">主题管理</div>
            <div class="text-gray-400 text-xs mt-1">管理系统主题色配置</div>
          </div>
          <div
            class="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-700"
            @click="navigateTo('/admin/config')"
          >
            <div class="text-orange-400 text-lg font-medium">系统配置</div>
            <div class="text-gray-400 text-xs mt-1">站点标题、描述、注册开关</div>
          </div>
          <div
            class="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-700"
            @click="navigateTo('/admin/ais')"
          >
            <div class="text-amber-400 text-lg font-medium">AI 服务商</div>
            <div class="text-gray-400 text-xs mt-1">AI 接口配置管理</div>
          </div>
          <a
            class="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-700"
            href="https://doc.cashbook.oldmoon.top"
            target="_blank"
          >
            <div class="text-cyan-400 text-lg font-medium">官方文档</div>
            <div class="text-gray-400 text-xs mt-1">部署文档、使用教程等</div>
          </a>
          <div
            class="bg-gray-700/50 rounded-lg p-4 border border-gray-600 cursor-pointer hover:bg-gray-700"
            @click="navigateTo('/api-docs')"
          >
            <div class="text-red-400 text-lg font-medium">API文档</div>
            <div class="text-gray-400 text-xs mt-1">系统API文档查看</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
