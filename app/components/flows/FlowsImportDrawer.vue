<template>
  <!-- 导入导出抽屉 -->
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex justify-start z-50"
    @click="$emit('close')"
  >
    <div
      class="bg-surface text-foreground w-full max-w-md h-full flex flex-col shadow-xl transform transition-transform border-r border-border"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="px-4 py-3 border-b border-border flex justify-between items-center"
      >
        <h3 class="text-lg font-semibold">导入导出</h3>
        <button
          @click="$emit('close')"
          class="text-foreground/50 hover:text-foreground/80 hover:bg-surface-muted p-1 rounded transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- 功能列表 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <!-- 账单导入 -->
        <div
          class="bg-surface-muted rounded-lg p-4 border border-border"
        >
          <h4
            class="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            三方账单导入
          </h4>
          <div class="space-y-2">
            <button
              @click="$emit('importAlipay')"
              class="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              支付宝账单
            </button>
            <button
              @click="$emit('importWechat')"
              class="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              微信账单
            </button>
            <button
              @click="$emit('importJd')"
              class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              京东金融账单
            </button>
          </div>
        </div>

        <!-- 自定义导入 -->
        <div
          class="bg-surface-muted rounded-lg p-4 border border-border"
        >
          <h4
            class="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
            数据导入
          </h4>
          <div class="space-y-2">
            <button
              @click="$emit('customImport')"
              class="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              自定义CSV导入
            </button>
            <button
              @click="$emit('importJson')"
              class="w-full px-3 py-2 bg-secondary-800 hover:bg-secondary-900 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              JSON导入
            </button>
          </div>
        </div>

        <!-- 数据导出 -->
        <div
          class="bg-surface-muted rounded-lg p-4 border border-border"
        >
          <h4
            class="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            数据导出
          </h4>
          <div class="space-y-2">
            <button
              @click="$emit('exportCsv')"
              class="w-full px-3 py-2 bg-secondary-800 hover:bg-secondary-900 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3M4 7h16"
                />
              </svg>
              导出CSV
            </button>
            <button
              @click="$emit('exportJson')"
              class="w-full px-3 py-2 bg-secondary-800 hover:bg-secondary-900 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3M4 7h16"
                />
              </svg>
              导出JSON
            </button>
          </div>
        </div>

        <!-- 模板管理 -->
        <div
          class="bg-surface-muted rounded-lg p-4 border border-border"
        >
          <h4
            class="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            模板导入

            <button
              @click="$emit('downloadTemplate')"
              class="text-primary-600 rounded text-sm hover:underline font-medium transition-colors flex items-center gap-2"
            >
              下载模板
            </button>
          </h4>
          <div class="space-y-2">
            <button
              @click="$emit('importTemplate')"
              class="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              模板导入
            </button>
          </div>
        </div>
      </div>

      <!-- 说明文档 -->
      <div
        class="px-4 py-3 border-t border-border bg-surface-muted"
      >
        <div class="text-xs text-foreground/70 space-y-1">
          <p class="flex items-center gap-1">
            <svg
              class="w-3 h-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            支持CSV、JSON格式导入导出
          </p>
          <p class="flex items-center gap-1">
            <svg
              class="w-3 h-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            可配置类型映射实现自动转换
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
}

defineProps<Props>();

defineEmits<{
  close: [];
  importAlipay: [];
  importWechat: [];
  importJd: [];
  customImport: [];
  importJson: [];
  exportJson: [];
  exportCsv: [];
  downloadTemplate: [];
  importTemplate: [];
}>();
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background-color: rgb(var(--color-surface-muted));
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-secondary-300));
  border-radius: 9999px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-secondary-400));
}
</style>
