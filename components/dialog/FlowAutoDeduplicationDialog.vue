<script setup lang="ts">
import { ref } from "vue";
import {
  XMarkIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";
import { showAutoDeduplicationFlowsDialog } from "~/utils/flag";
import { Alert } from "~/utils/alert";
import { Confirm } from "~/utils/confirm";

// ESC键监听
useEscapeKey(() => {
  if (showAutoDeduplicationFlowsDialog.value) {
    showAutoDeduplicationFlowsDialog.value = false;
  }
}, showAutoDeduplicationFlowsDialog);

interface DuplicateData {
  duplicateGroups: Flow[][];
  totalGroups: number;
  totalDuplicates: number;
}

const duplicateData = ref<DuplicateData>({
  duplicateGroups: [],
  totalGroups: 0,
  totalDuplicates: 0,
});

const loading = ref(false);

// 定义去重检测条件
const deduplicationCriteria = ref({
  name: true,
  description: true,
  industryType: true,
  flowType: true,
  payType: true,
});

// 获取疑似重复数据
const fetchDuplicates = () => {
  loading.value = true;
  doApi
    .post<DuplicateData>("api/entry/flow/deduplication/autos", {
      bookId: localStorage.getItem("bookId"),
      criteria: deduplicationCriteria.value, // 传递检测条件
    })
    .then((res) => {
      duplicateData.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 初始化获取重复数据
fetchDuplicates();

// 删除流水记录
const deleteFlow = (item: Flow) => {
  if (!item.id) {
    Alert.error("无法删除，ID不存在");
    return;
  }

  Confirm.open({
    title: "删除确认",
    content: `确定删除流水 【${item.name}:${item.money}】吗?`,
    confirm: () => {
      doApi
        .post("api/entry/flow/del", {
          id: item.id,
          bookId: localStorage.getItem("bookId"),
        })
        .then(() => {
          Alert.success("删除成功");
          // 重新加载数据
          fetchDuplicates();
        })
        .catch((error) => {
          console.error("删除失败", error);
          Alert.error("删除失败");
        });
    },
  });
};

// 关闭对话框
const closeDialog = () => {
  showAutoDeduplicationFlowsDialog.value = false;
};

// 格式化日期显示
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return dateStr;
};
</script>

<template>
  <!-- 自助去重对话框 -->
  <div
    v-if="showAutoDeduplicationFlowsDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col transform transition-all"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center"
      >
        <div>
          <h3 class="text-xl font-semibold text-green-950 dark:text-white">
            疑似重复数据检测
          </h3>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            共发现 {{ duplicateData.totalGroups }} 组疑似重复数据，涉及
            {{ duplicateData.totalDuplicates }} 条记录
          </div>
        </div>
        <button
          @click="closeDialog"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 检测条件选择器 -->
      <div
        class="px-6 py-2 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-600"
      >
        <div
          class="flex flex-col lg:flex-row items-start lg:items-center gap-2 md:gap-4"
        >
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
            检测条件选择（日期和金额为默认条件）：
          </div>
          <div class="flex flex-wrap gap-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deduplicationCriteria.name"
                class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >名称</span
              >
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deduplicationCriteria.description"
                class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >备注</span
              >
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deduplicationCriteria.flowType"
                class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >流水类型</span
              >
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deduplicationCriteria.industryType"
                class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >支出/收入类型</span
              >
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deduplicationCriteria.payType"
                class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >支付/收款方式</span
              >
            </label>
            <button
              @click="fetchDuplicates"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon class="w-4 h-4" />
              <span class="hidden md:inline">应用筛选条件</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 数据内容区域 -->
      <div class="flex-1 overflow-hidden">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
          <span class="ml-4 text-gray-600 dark:text-gray-400">加载中...</span>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="duplicateData.duplicateGroups.length === 0"
          class="text-center py-20"
        >
          <div class="text-gray-400 dark:text-gray-500 mb-4">
            <DocumentDuplicateIcon class="mx-auto h-16 w-16" />
          </div>
          <h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            未发现疑似重复数据
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            系统未发现符合条件的重复流水数据
          </p>
        </div>

        <!-- 重复数据组列表 -->
        <div
          v-else
          class="p-2 md:p-4 space-y-2 md:space-y-4 overflow-y-auto max-h-[calc(95vh-280px)]"
        >
          <div
            v-for="(group, groupIndex) in duplicateData.duplicateGroups"
            :key="groupIndex"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
          >
            <!-- 组标题 -->
            <div
              class="bg-gray-100 dark:bg-gray-700 px-2 py-1 border-b border-gray-200 dark:border-gray-600"
            >
              <div
                class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
              >
                <span
                  class="text-base md:text-lg font-semibold text-gray-900 dark:text-white"
                >
                  疑似重复组 #{{ groupIndex + 1 }}-{{ group.length }}条
                </span>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(group[0]?.day) }} | {{ group[0]?.flowType }} |
                  {{ group[0]?.money?.toFixed(2) }}元
                </div>
              </div>
            </div>

            <!-- 桌面端表格 -->
            <div class="hidden md:block overflow-x-auto">
              <table
                class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
              >
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      类型
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      名称
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      金额
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      日期
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      支付/收款方式
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      类别
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      备注
                    </th>
                    <th
                      class="px-2 py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <tr
                    v-for="(item, itemIndex) in group"
                    :key="item.id"
                    :class="
                      itemIndex % 2 === 0
                        ? 'bg-gray-50 dark:bg-gray-700/30'
                        : 'bg-white dark:bg-gray-800'
                    "
                    class="hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <td class="px-2 py-1">
                      <span
                        :class="[
                          'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                          item.flowType === '支出'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : item.flowType === '收入'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                        ]"
                      >
                        {{ item.flowType }}
                      </span>
                    </td>
                    <td
                      class="px-2 py-1 text-sm text-gray-900 dark:text-gray-100 max-w-48 truncate"
                      :title="item.name"
                    >
                      {{ item.name }}
                    </td>
                    <td class="px-2 py-1">
                      <span
                        :class="[
                          'text-sm font-semibold',
                          item.flowType === '支出'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400',
                        ]"
                      >
                        {{ Number(item.money).toFixed(2) }}
                      </span>
                    </td>
                    <td
                      class="px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {{ formatDate(item.day) }}
                    </td>
                    <td
                      class="px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {{ item.payType }}
                    </td>
                    <td
                      class="px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {{ item.industryType }}
                    </td>
                    <td
                      class="px-2 py-1 text-sm text-gray-900 dark:text-gray-100 max-w-48 truncate"
                      :title="item.description"
                    >
                      {{ item.description || "-" }}
                    </td>
                    <td class="px-2 py-1 text-center">
                      <button
                        @click="deleteFlow(item)"
                        class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors flex items-center gap-1 mx-auto"
                      >
                        <TrashIcon class="w-3 h-3" />
                        删除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 移动端卡片 -->
            <div class="md:hidden">
              <div
                v-for="(item, itemIndex) in group"
                :key="item.id"
                class="p-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                :class="
                  itemIndex % 2 === 0
                    ? 'bg-gray-50 dark:bg-gray-700/30'
                    : 'bg-white dark:bg-gray-800'
                "
              >
                <!-- 流水类型和金额 -->
                <div class="flex items-center justify-between mb-2">
                  <span
                    :class="[
                      'inline-flex px-3 py-1 text-sm font-medium rounded-full',
                      item.flowType === '支出'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : item.flowType === '收入'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                    ]"
                  >
                    {{ item.flowType }}
                  </span>
                  <span
                    :class="[
                      'text-lg font-bold',
                      item.flowType === '支出'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400',
                    ]"
                  >
                    {{ Number(item.money).toFixed(2) }}
                  </span>
                </div>

                <!-- 详细信息 -->
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">名称:</span>
                    <span
                      class="text-gray-900 dark:text-gray-100 max-w-40 truncate text-right"
                      :title="item.name"
                    >
                      {{ item.name }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400"
                      >支付方式:</span
                    >
                    <span class="text-gray-900 dark:text-gray-100">{{
                      item.payType
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">类别:</span>
                    <span class="text-gray-900 dark:text-gray-100">{{
                      item.industryType
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">日期:</span>
                    <span class="text-gray-900 dark:text-gray-100">{{
                      formatDate(item.day)
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">备注:</span>
                    <span
                      class="text-gray-900 dark:text-gray-100 max-w-40 truncate text-right"
                      :title="item.description"
                    >
                      {{ item.description || "-" }}
                    </span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div
                  class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600"
                >
                  <button
                    @click="deleteFlow(item)"
                    class="w-full px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <TrashIcon class="w-4 h-4" />
                    删除重复项
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30"
      >
        <div class="flex justify-center gap-4">
          <button
            @click="fetchDuplicates"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon class="w-4 h-4" />
            刷新数据
          </button>
          <button
            @click="closeDialog"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
  height: 4px;
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

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-700;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
</style>
