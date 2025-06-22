<script setup lang="ts">
// 需要登录
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-8rem)]">
    <div class="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700 max-w-md w-full mx-4">
      <div class="text-center">
        <!-- 欢迎图标 -->
        <div class="mb-6">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"></path>
            </svg>
          </div>
        </div>
        
        <!-- 欢迎文字 -->
        <h1 class="text-2xl font-bold text-white mb-2">
          欢迎使用管理后台
        </h1>
        <p class="text-gray-300 mb-6">
          {{ SystemConfig?.title }}
        </p>
        
        <!-- 功能卡片 -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
            <div class="text-blue-400 font-medium">用户管理</div>
            <div class="text-gray-400 text-xs mt-1">管理系统用户</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
            <div class="text-green-400 font-medium">账本管理</div>
            <div class="text-gray-400 text-xs mt-1">管理用户账本</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
            <div class="text-purple-400 font-medium">映射管理</div>
            <div class="text-gray-400 text-xs mt-1">CSV导入映射</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
            <div class="text-orange-400 font-medium">系统设置</div>
            <div class="text-gray-400 text-xs mt-1">系统配置管理</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
