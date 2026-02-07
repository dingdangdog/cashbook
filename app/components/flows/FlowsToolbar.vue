<template>
  <div
    class="flex flex-col gap-2 bg-surface rounded-lg shadow-sm border border-border p-2 mb-2 md:mb-4 text-foreground"
  >
    <!-- 第一行：主要操作按钮 - 桌面端水平排列，手机端垂直堆叠 -->
    <div class="flex flex-col md:flex-row md:justify-between gap-2">
      <div class="flex flex-wrap gap-2">
        <button
          @click="$emit('openImportExport')"
          class="flex-1 md:flex-none px-2 py-1 md:px-3 md:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <CloudArrowDownIcon class="w-4 h-4" />
          <span class="hidden sm:inline">导入导出</span>
          <span class="sm:hidden">导入</span>
        </button>
        <button
          @click="$emit('autoMerge')"
          class="flex-1 md:flex-none px-2 py-1 md:px-3 md:py-2 bg-secondary-700 hover:bg-secondary-800 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <AdjustmentsHorizontalIcon class="w-4 h-4" />
          <span class="hidden sm:inline">自助平账</span>
          <span class="sm:hidden">平账</span>
        </button>
        <button
          @click="$emit('autoDeduplication')"
          class="flex-1 md:flex-none px-2 py-1 md:px-3 md:py-2 bg-secondary-700 hover:bg-secondary-800 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <DocumentDuplicateIcon class="w-4 h-4" />
          <span class="hidden sm:inline">自助去重</span>
          <span class="sm:hidden">去重</span>
        </button>
        <button
          @click="$emit('createNew')"
          class="flex-1 md:flex-none px-2 py-1 md:px-3 md:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <PlusIcon class="w-4 h-4" />
          新增
        </button>
      </div>

      <div class="flex flex-col sm:flex-row gap-2">
        <!-- 批量操作 - 有选中项时显示 -->
        <div v-if="selectedCount > 0" class="flex gap-2">
          <button
            @click="$emit('deleteSelected')"
            class="flex-1 sm:flex-none px-2 py-1 md:px-3 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <TrashIcon class="w-4 h-4" />
            <span class="hidden sm:inline">删除选中({{ selectedCount }})</span>
            <span class="sm:hidden">删除({{ selectedCount }})</span>
          </button>
          <button
            @click="$emit('batchChangeType')"
            class="flex-1 sm:flex-none px-2 py-1 md:px-3 md:py-2 bg-secondary-700 hover:bg-secondary-800 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <PencilSquareIcon class="w-4 h-4" />
            <span class="hidden sm:inline">类型修改({{ selectedCount }})</span>
            <span class="sm:hidden">修改({{ selectedCount }})</span>
          </button>
        </div>

        <!-- 筛选操作 -->
        <div class="flex gap-2">
          <button
            @click="$emit('openSearch')"
            class="flex-1 sm:flex-none px-2 py-1 md:px-3 md:py-2 bg-surface-muted hover:bg-surface text-foreground rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium border border-border"
          >
            <FunnelIcon class="w-4 h-4" />
            筛选
          </button>
          <button
            @click="$emit('resetQuery')"
            class="flex-1 sm:flex-none px-2 py-1 md:px-3 md:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <ArrowPathIcon class="w-4 h-4" />
            重置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CloudArrowDownIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/vue/24/outline";

interface Props {
  selectedCount: number;
}

defineProps<Props>();

defineEmits<{
  openImportExport: [];
  autoMerge: [];
  autoDeduplication: [];
  createNew: [];
  deleteSelected: [];
  batchChangeType: [];
  openSearch: [];
  resetQuery: [];
}>();
</script>
