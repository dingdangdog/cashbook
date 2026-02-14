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
        <h3 class="text-base md:text-lg font-semibold">导入导出</h3>
        <button
          @click="$emit('close')"
          class="text-foreground/50 hover:text-foreground/80 hover:bg-surface-muted p-1 rounded transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 功能列表 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <!-- 账单导入 -->
        <div class="bg-surface-muted rounded-lg p-4 border border-border">
          <h4
            class="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2"
          >
            <DocumentTextIcon class="w-5 h-5 shrink-0" />
            三方账单导入
          </h4>
          <div class="space-y-2">
            <button
              @click="$emit('importAlipay')"
              class="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon class="w-5 h-5 shrink-0" />
              支付宝账单
            </button>
            <button
              @click="$emit('importWechat')"
              class="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon class="w-5 h-5 shrink-0" />
              微信账单
            </button>
            <button
              @click="$emit('importJd')"
              class="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon class="w-5 h-5 shrink-0" />
              京东金融账单
            </button>
          </div>
        </div>

        <!-- 自定义导入 -->
        <div class="bg-surface-muted rounded-lg p-4 border border-border">
          <h4
            class="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2"
          >
            <CloudArrowUpIcon class="w-5 h-5 shrink-0" />
            数据导入
          </h4>
          <div class="space-y-2">
            <button
              @click="$emit('customImport')"
              class="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <DocumentTextIcon class="w-5 h-5 shrink-0" />
              自定义CSV导入
            </button>
            <button
              @click="$emit('importJson')"
              class="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <DocumentTextIcon class="w-5 h-5 shrink-0" />
              JSON导入
            </button>
          </div>
        </div>

        <!-- 数据导出 -->
        <div class="bg-surface-muted rounded-lg p-4 border border-border">
          <h4
            class="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2"
          >
            <ArrowDownTrayIcon class="w-5 h-5 shrink-0" />
            数据导出
          </h4>
          <div class="space-y-2">
            <button
              @click="$emit('exportCsv')"
              class="w-full px-3 py-2 bg-secondary-800 hover:bg-secondary-900 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <ArrowDownTrayIcon class="w-5 h-5 shrink-0" />
              导出CSV
            </button>
            <button
              @click="$emit('exportJson')"
              class="w-full px-3 py-2 bg-secondary-800 hover:bg-secondary-900 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <ArrowDownTrayIcon class="w-5 h-5 shrink-0" />
              导出JSON
            </button>
          </div>
        </div>

        <!-- 模板管理 -->
        <div class="bg-surface-muted rounded-lg p-4 border border-border">
          <h4
            class="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2"
          >
            <DocumentDuplicateIcon class="w-5 h-5 shrink-0" />
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
              <ArrowUpTrayIcon class="w-5 h-5 shrink-0" />
              模板导入
            </button>
          </div>
        </div>
      </div>

      <!-- 说明文档 -->
      <div class="px-4 py-3 border-t border-border bg-surface-muted">
        <div class="text-xs text-foreground/70 space-y-1">
          <p class="flex items-center gap-1">
            <InformationCircleIcon class="w-4 h-4 flex-shrink-0" />
            支持CSV、JSON格式导入导出
          </p>
          <p class="flex items-center gap-1">
            <InformationCircleIcon class="w-4 h-4 flex-shrink-0" />
            可配置类型映射实现自动转换
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  XMarkIcon,
  DocumentTextIcon,
  PlusIcon,
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  ArrowUpTrayIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";

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
