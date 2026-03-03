<template>
  <!-- 导入导出抽屉 -->
  <div
    v-if="show"
    class="fixed inset-0 bg-black/60 flex justify-start z-50"
    @click="$emit('close')"
  >
    <div
      class="bg-surface dark:bg-surface-dark w-full max-w-md h-full flex flex-col shadow-xl transform transition-transform border-r border-frame dark:border-frame-dark"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="px-4 py-3 border-b border-frame-light dark:border-frame-dark flex justify-between items-center"
      >
        <h3 class="text-lg font-semibold text-ink-primary dark:text-ink-onDark">
          导入导出
        </h3>
        <button
          @click="$emit('close')"
          class="text-ink-muted hover:text-ink-secondary dark:text-ink-onDark dark:hover:text-ink-onDark hover:bg-surface-soft dark:hover:bg-surface-darkMuted p-1 rounded transition-colors"
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
          class="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-4 border border-frame-light dark:border-frame-dark"
        >
          <h4
            class="text-sm font-semibold text-brand-700 dark:text-brand-300 mb-3 flex items-center gap-2"
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
              class="w-full px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
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
              class="w-full px-3 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
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
              class="w-full px-3 py-2 bg-state-danger hover:bg-state-danger/90 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
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
          class="bg-surface-soft dark:bg-surface-darkMuted rounded-lg p-4 border border-frame-light dark:border-frame-dark"
        >
          <h4
            class="text-sm font-semibold text-ink-secondary dark:text-ink-onDark mb-3 flex items-center gap-2"
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
              class="w-full px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
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
              class="w-full px-3 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
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
          class="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-4 border border-frame-light dark:border-frame-dark"
        >
          <h4
            class="text-sm font-semibold text-brand-700 dark:text-brand-300 mb-3 flex items-center gap-2"
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
              class="w-full px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
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
              class="w-full px-3 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
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
          class="bg-surface-soft dark:bg-surface-darkMuted rounded-lg p-4 border border-frame-light dark:border-frame-dark"
        >
          <h4
            class="text-sm font-semibold text-ink-secondary dark:text-ink-onDark mb-3 flex items-center gap-2"
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
              class="text-brand-600 rounded text-sm hover:underline font-medium transition-colors flex items-center gap-2"
            >
              下载模板
            </button>
          </h4>
          <div class="space-y-2">
            <button
              @click="$emit('importTemplate')"
              class="w-full px-3 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
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
        class="px-4 py-3 border-t border-frame-light dark:border-frame-dark bg-surface-soft dark:bg-surface-darkMuted"
      >
        <div class="text-xs text-ink-muted dark:text-ink-onDark space-y-1">
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
  @apply bg-gray-100 dark:bg-gray-700;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
</style>
