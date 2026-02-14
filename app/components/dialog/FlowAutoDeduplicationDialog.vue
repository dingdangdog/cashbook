<script setup lang="ts">
import { ref, computed } from "vue";
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
const selectedIds = ref<number[]>([]);

// 定义去重检测条件
const deduplicationCriteria = ref({
  name: true,
  description: true,
  industryType: true,
  flowType: true,
  payType: true,
});

// 计算属性
const selectedCount = computed(() => selectedIds.value.length);
const isAllSelected = computed(() => {
  const total = duplicateData.value.duplicateGroups.reduce(
    (sum, group) => sum + group.length,
    0
  );
  if (total === 0) return false;
  return selectedIds.value.length > 0 && selectedIds.value.length === total;
});

// 获取疑似重复数据
const fetchDuplicates = () => {
  loading.value = true;
  doApi
    .post<DuplicateData>("api/entry/flow/deduplication/autos", {
      
      criteria: deduplicationCriteria.value, // 传递检测条件
    })
    .then((res) => {
      duplicateData.value = res;
      selectedIds.value = []; // 重置选择
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

// 全选/取消全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    const allIds: number[] = [];
    duplicateData.value.duplicateGroups.forEach((group) => {
      group.forEach((item) => {
        if (item.id) {
          allIds.push(Number(item.id));
        }
      });
    });
    selectedIds.value = allIds;
  }
};

// 批量删除
const batchDeleteFlows = () => {
  if (selectedIds.value.length === 0) {
    Alert.error("请先选择要删除的项");
    return;
  }

  Confirm.open({
    title: "批量删除确认",
    content: `确定要删除已选择的 ${selectedIds.value.length} 条重复记录吗？此操作不可撤销！`,
    confirm: () => {
      loading.value = true;
      doApi
        .post("api/entry/flow/dels", {
          ids: selectedIds.value,
          
        })
        .then(() => {
          Alert.success(`成功删除 ${selectedIds.value.length} 条记录`);
          // 重新加载数据
          fetchDuplicates();
        })
        .catch((error) => {
          console.error("批量删除失败", error);
          Alert.error("批量删除失败");
        })
        .finally(() => {
          loading.value = false;
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
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col transform transition-all border border-border"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="px-2 md:px-6 py-2 md:py-4 border-b border-border flex justify-between"
      >
        <div class="flex-1 flex flex-col md:flex-row justify-between">
          <div class="flex-1">
            <h3 class="text-xl font-semibold">疑似重复数据检测</h3>
            <div class="text-sm text-foreground/60 mt-1">
              共发现 {{ duplicateData.totalGroups }} 组疑似重复数据，涉及
              {{ duplicateData.totalDuplicates }} 条记录
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-foreground/70">
              已选 {{ selectedCount }} 项
            </span>
            <button
              @click="toggleSelectAll"
              class="px-3 py-1 bg-surface hover:bg-surface-muted text-foreground/80 rounded text-sm font-medium transition-colors border border-border"
            >
              {{ isAllSelected ? "取消全选" : "全选" }}
            </button>
            <button
              @click="batchDeleteFlows"
              :disabled="selectedIds.length === 0 || loading"
              class="px-3 py-1 bg-red-600 disabled:opacity-50 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
            >
              批量删除
            </button>
          </div>
        </div>
        <button
          @click="closeDialog"
          class="text-foreground/50 hover:text-foreground/80 hover:bg-surface-muted p-2 rounded transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 检测条件选择器 -->
      <div
        class="px-2 md:px-6 py-2 bg-surface-muted border-b border-border"
      >
        <div
          class="flex flex-col lg:flex-row items-start lg:items-center gap-2 md:gap-4"
        >
          <div class="text-sm font-medium text-foreground/80">
            检测条件选择（日期和金额为默认条件）：
          </div>
          <div class="flex flex-wrap gap-2 md:gap-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deduplicationCriteria.name"
                class="w-4 h-4 text-primary-600 bg-background border-border rounded focus:ring-primary-500 focus:ring-2"
              />
              <span class="ml-2 text-sm text-foreground/80">名称</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deduplicationCriteria.description"
                class="w-4 h-4 text-primary-600 bg-background border-border rounded focus:ring-primary-500 focus:ring-2"
              />
              <span class="ml-2 text-sm text-foreground/80">备注</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deduplicationCriteria.flowType"
                class="w-4 h-4 text-primary-600 bg-background border-border rounded focus:ring-primary-500 focus:ring-2"
              />
              <span class="ml-2 text-sm text-foreground/80">流水类型</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deduplicationCriteria.industryType"
                class="w-4 h-4 text-primary-600 bg-background border-border rounded focus:ring-primary-500 focus:ring-2"
              />
              <span class="ml-2 text-sm text-foreground/80">支出/收入类型</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deduplicationCriteria.payType"
                class="w-4 h-4 text-primary-600 bg-background border-border rounded focus:ring-primary-500 focus:ring-2"
              />
              <span class="ml-2 text-sm text-foreground/80">支付/收款方式</span>
            </label>
            <button
              @click="fetchDuplicates"
              class="px-3 py-1 md:px-4 md:py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
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
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
          ></div>
          <span class="ml-4 text-foreground/60">加载中...</span>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="duplicateData.duplicateGroups.length === 0"
          class="text-center py-20"
        >
          <div class="text-foreground/40 mb-4">
            <DocumentDuplicateIcon class="mx-auto h-16 w-16" />
          </div>
          <h3 class="text-xl font-medium mb-2">
            未发现疑似重复数据
          </h3>
          <p class="text-foreground/60">
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
            class="bg-surface border border-border rounded-lg overflow-hidden"
          >
            <!-- 组标题 -->
            <div
              class="bg-surface-muted px-2 py-1 border-b border-border"
            >
              <div
                class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
              >
                <span
                  class="text-base md:text-lg font-semibold"
                >
                  疑似重复组 #{{ groupIndex + 1 }}-{{ group.length }}条
                </span>
                <div class="text-sm text-foreground/60">
                  {{ formatDate(group[0]?.day) }} | {{ group[0]?.flowType }} |
                  {{ group[0]?.money?.toFixed(2) }}元
                </div>
              </div>
            </div>

            <!-- 桌面端表格 -->
            <div class="hidden md:block overflow-x-auto">
              <table
                class="min-w-full divide-y divide-border"
              >
                <thead class="bg-surface">
                  <tr>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
                    >
                      类型
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
                    >
                      名称
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
                    >
                      金额
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
                    >
                      日期
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
                    >
                      支付/收款方式
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
                    >
                      类别
                    </th>
                    <th
                      class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
                    >
                      备注
                    </th>
                    <th
                      class="px-2 py-1 text-center text-xs font-medium text-foreground/60 uppercase tracking-wider"
                    >
                      操作
                    </th>
                    <th
                      class="px-2 py-1 text-center text-xs font-medium text-foreground/60 uppercase tracking-wider"
                    >
                      选择
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="bg-surface divide-y divide-border"
                >
                  <tr
                    v-for="(item, itemIndex) in group"
                    :key="item.id"
                    :class="
                      itemIndex % 2 === 0
                        ? 'bg-surface-muted/50'
                        : 'bg-surface'
                    "
                    class="hover:bg-surface-muted transition-colors"
                  >
                    <td class="px-2 py-1">
                      <span
                        :class="[
                          'inline-flex px-2 py-1 text-xs font-medium rounded-full border',
                          item.flowType === '支出'
                            ? 'bg-red-500/10 text-red-600 border-red-500/20'
                            : item.flowType === '收入'
                            ? 'bg-primary-500/10 text-primary-700 border-primary-500/20'
                            : 'bg-surface-muted text-foreground/70 border-border',
                        ]"
                      >
                        {{ item.flowType }}
                      </span>
                    </td>
                    <td
                      class="px-2 py-1 text-sm max-w-48 truncate"
                      :title="item.name"
                    >
                      {{ item.name }}
                    </td>
                    <td class="px-2 py-1">
                      <span
                        :class="[
                          'text-sm font-semibold',
                          item.flowType === '支出'
                            ? 'text-red-600'
                            : 'text-primary-600',
                        ]"
                      >
                        {{ Number(item.money).toFixed(2) }}
                      </span>
                    </td>
                    <td
                      class="px-2 py-1 text-sm"
                    >
                      {{ formatDate(item.day) }}
                    </td>
                    <td
                      class="px-2 py-1 text-sm"
                    >
                      {{ item.payType }}
                    </td>
                    <td
                      class="px-2 py-1 text-sm"
                    >
                      {{ item.industryType }}
                    </td>
                    <td
                      class="px-2 py-1 text-sm max-w-48 truncate"
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
                    <td class="px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        class="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                        :value="item.id"
                        v-model="selectedIds"
                      />
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
                class="p-2 border-b border-border last:border-b-0"
                :class="
                  itemIndex % 2 === 0
                    ? 'bg-surface-muted/50'
                    : 'bg-surface'
                "
              >
                <!-- 选择框 -->
                <div class="flex items-center justify-between mb-2">
                  <div class="text-xs text-foreground/60">选择</div>
                  <input
                    type="checkbox"
                    class="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                    :value="item.id"
                    v-model="selectedIds"
                  />
                </div>
                <!-- 流水类型和金额 -->
                <div class="flex items-center justify-between mb-2">
                  <span
                    :class="[
                      'inline-flex px-3 py-1 text-sm font-medium rounded-full border',
                      item.flowType === '支出'
                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : item.flowType === '收入'
                        ? 'bg-primary-500/10 text-primary-700 border-primary-500/20'
                        : 'bg-surface-muted text-foreground/70 border-border',
                    ]"
                  >
                    {{ item.flowType }}
                  </span>
                  <span
                    :class="[
                      'text-lg font-bold',
                      item.flowType === '支出'
                        ? 'text-red-600'
                        : 'text-primary-600',
                    ]"
                  >
                    {{ Number(item.money).toFixed(2) }}
                  </span>
                </div>

                <!-- 详细信息 -->
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-foreground/60">名称:</span>
                    <span
                      class="max-w-40 truncate text-right"
                      :title="item.name"
                    >
                      {{ item.name }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-foreground/60">支付方式:</span>
                    <span>{{ item.payType }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-foreground/60">类别:</span>
                    <span>{{ item.industryType }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-foreground/60">日期:</span>
                    <span>{{ formatDate(item.day) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-foreground/60">备注:</span>
                    <span
                      class="max-w-40 truncate text-right"
                      :title="item.description"
                    >
                      {{ item.description || "-" }}
                    </span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div
                  class="mt-2 pt-2 border-t border-border flex gap-2"
                >
                  <button
                    @click="deleteFlow(item)"
                    class="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <TrashIcon class="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div
        class="px-6 py-4 border-t border-border bg-surface-muted"
      >
        <div class="flex justify-center gap-4">
          <button
            @click="fetchDuplicates"
            class="px-3 py-1 md:px-4 md:py-2 text-sm md:text-base bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon class="w-4 h-4" />
            刷新数据
          </button>
          <button
            @click="batchDeleteFlows"
            :disabled="selectedIds.length === 0 || loading"
            class="px-3 py-1 md:px-4 md:py-2 text-sm md:text-base bg-red-600 disabled:opacity-50 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <TrashIcon class="w-4 h-4" />
            删除 ({{ selectedCount }})
          </button>
          <button
            @click="closeDialog"
            class="px-3 py-1 md:px-4 md:py-2 text-sm md:text-base bg-surface hover:bg-surface-muted text-foreground/80 font-medium rounded-lg transition-colors border border-border"
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
  background-color: rgb(var(--color-surface-muted));
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-secondary-300));
  border-radius: 9999px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-secondary-400));
}

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background-color: rgb(var(--color-surface-muted));
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-secondary-300));
  border-radius: 9999px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-secondary-400));
}
</style>
