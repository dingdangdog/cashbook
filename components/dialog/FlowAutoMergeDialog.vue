<template>
  <!-- 自助平账对话框 -->
  <div
    v-if="showAutoMergeFlowsDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="closeDialog"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[95vw] max-h-[90vh] flex flex-col transform transition-all"
      @click.stop
    >
      <!-- 紧凑的标题栏 -->
      <div
        class="px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center"
      >
        <h3 class="text-lg font-semibold text-green-950 dark:text-white">
          自动平账候选数据
        </h3>
        <div class="flex items-center gap-2">
          <button
            @click="ignoreAllBalance"
            class="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors"
          >
            忽略全部
          </button>
          <button
            @click="closeDialog"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="flex-1 overflow-hidden">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
          <span class="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="candidatePairs.length === 0" class="text-center py-20">
          <div class="text-gray-400 dark:text-gray-500 mb-4">
            <AdjustmentsHorizontalIcon class="mx-auto h-12 w-12" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            暂无平账候选数据
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            系统未发现可以自动平账的数据
          </p>
        </div>

        <!-- 桌面端表格 -->
        <div v-else class="hidden lg:block h-full overflow-y-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <!-- 左侧数据列组 -->
                <th
                  colspan="6"
                  class="px-4 py-3 text-center text-lg font-bold text-gray-800 dark:text-gray-200 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800"
                >
                  左侧数据
                </th>
                <!-- 操作列 -->
                <th
                  rowspan="2"
                  class="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600"
                >
                  操作
                </th>
                <!-- 右侧数据列组 -->
                <th
                  colspan="6"
                  class="px-4 py-3 text-center text-lg font-bold text-gray-800 dark:text-gray-200 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800"
                >
                  右侧数据
                </th>
              </tr>
              <tr>
                <!-- 左侧数据子列 -->
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                  类型
                </th>
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                  金额
                </th>
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                  名称
                </th>
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                  支付方式
                </th>
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                  类别
                </th>
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                  日期
                </th>
                <!-- 右侧数据子列 -->
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-purple-50 dark:bg-purple-900/20">
                  日期
                </th>
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-purple-50 dark:bg-purple-900/20">
                  类别
                </th>
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-purple-50 dark:bg-purple-900/20">
                  支付方式
                </th>
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-purple-50 dark:bg-purple-900/20">
                  名称
                </th>
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-purple-50 dark:bg-purple-900/20">
                  金额
                </th>
                <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-purple-50 dark:bg-purple-900/20">
                  类型
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="(pair, index) in candidatePairs"
                :key="index"
                :class="
                  index % 2 === 0
                    ? 'bg-gray-50 dark:bg-gray-700/30'
                    : 'bg-white dark:bg-gray-800'
                "
                class="hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <!-- 左侧数据 -->
                <td class="px-3 py-3 text-center">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      pair.out.flowType === '支出'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : pair.out.flowType === '收入'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                    ]"
                  >
                    {{ pair.out.flowType }}
                  </span>
                </td>
                <td class="px-3 py-3 text-center">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      pair.out.flowType === '支出'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : pair.out.flowType === '收入'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                    ]"
                  >
                    {{ Number(pair.out.money).toFixed(2) }}
                  </span>
                </td>
                <td
                  class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-32 truncate text-center"
                  :title="pair.out.name"
                >
                  {{ pair.out.name }}
                </td>
                <td class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">
                  {{ pair.out.payType }}
                </td>
                <td class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">
                  {{ pair.out.industryType }}
                </td>
                <td class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">
                  {{ pair.out.day }}
                </td>
                <!-- 操作列 -->
                <td class="px-3 py-3 text-center">
                  <div class="flex flex-col gap-1 justify-center">
                    <button
                      @click="confirmBalance(pair)"
                      class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckIcon class="w-3 h-3" />
                      平账
                    </button>
                    <button
                      @click="ignoreBalance(pair)"
                      class="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <EyeSlashIcon class="w-3 h-3" />
                      忽略
                    </button>
                  </div>
                </td>
                <!-- 右侧数据 -->
                <td class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">
                  {{ pair.in.day }}
                </td>
                <td class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">
                  {{ pair.in.industryType }}
                </td>
                <td class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">
                  {{ pair.in.payType }}
                </td>
                <td
                  class="px-3 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-32 truncate text-center"
                  :title="pair.in.name"
                >
                  {{ pair.in.name }}
                </td>
                <td class="px-3 py-3 text-center">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      pair.in.flowType === '支出'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : pair.in.flowType === '收入'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                    ]"
                  >
                    {{ Number(pair.in.money).toFixed(2) }}
                  </span>
                </td>
                <td class="px-3 py-3 text-center">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      pair.in.flowType === '支出'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : pair.in.flowType === '收入'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                    ]"
                  >
                    {{ pair.in.flowType }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 移动端卡片 -->
        <div class="lg:hidden max-h-[75vh] overflow-y-auto p-1">
          <div class="space-y-2">
            <div
              v-for="(pair, index) in candidatePairs"
              :key="index"
              class="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 md:p-3 border border-gray-200 dark:border-gray-600"
            >
              <!-- 左右对比布局 -->
              <div class="grid grid-cols-2 gap-3">
                <!-- 支出卡片 -->
                <div
                  class="bg-red-50 dark:bg-red-900/20 rounded p-2 border border-red-200 dark:border-red-800"
                  :class="{
                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800':
                      pair.out.flowType === '支出',
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800':
                      pair.out.flowType === '收入',
                    'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-600':
                      pair.out.flowType === '不计收支',
                  }"
                >
                  <div
                    class="text-xs font-semibold mb-1.5 flex items-center gap-1"
                    :class="{
                      'text-red-800 dark:text-red-300':
                        pair.out.flowType === '支出',
                      'text-green-800 dark:text-green-300':
                        pair.out.flowType === '收入',
                      'text-gray-800 dark:text-gray-300':
                        pair.out.flowType === '不计收支',
                    }"
                  >
                    <MinusIcon
                      v-if="pair.out.flowType === '支出'"
                      class="w-3 h-3"
                    />
                    <PlusIcon
                      v-else-if="pair.out.flowType === '收入'"
                      class="w-3 h-3"
                    />
                    <ScaleIcon v-else class="w-3 h-3" />
                    {{ pair.out.flowType }}
                  </div>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >金额</span
                      >
                      <span
                        class="font-medium text-xs"
                        :class="{
                          'text-red-600 dark:text-red-400':
                            pair.out.flowType === '支出',
                          'text-green-600 dark:text-green-400':
                            pair.out.flowType === '收入',
                          'text-gray-600 dark:text-gray-400':
                            pair.out.flowType === '不计收支',
                        }"
                        >{{ Number(pair.out.money).toFixed(2) }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >名称</span
                      >
                      <span
                        class="text-gray-900 dark:text-gray-100 text-[10px] truncate max-w-[60%]"
                        :title="pair.out.name"
                        >{{ pair.out.name }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >类型</span
                      >
                      <span
                        class="text-gray-900 dark:text-gray-100 text-[10px] truncate max-w-[60%]"
                        >{{ pair.out.industryType }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span
                        class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >{{
                          pair.out.flowType === "收入" ? "收款" : "支付"
                        }}</span
                      >
                      <span
                        class="text-gray-900 dark:text-gray-100 text-[10px] truncate max-w-[60%]"
                        >{{ pair.out.payType }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >日期</span
                      >
                      <span
                        class="text-gray-900 dark:text-gray-100 text-[10px]"
                        >{{ pair.out.day }}</span
                      >
                    </div>
                    <div
                      v-if="pair.out.description"
                      class="flex justify-between items-center"
                    >
                      <span class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >备注</span
                      >
                      <span
                        class="text-gray-900 dark:text-gray-100 text-[10px] truncate max-w-[60%]"
                        :title="pair.out.description"
                        >{{ pair.out.description }}</span
                      >
                    </div>
                  </div>
                </div>

                <!-- 收入卡片 -->
                <div
                  class="rounded p-2 border"
                  :class="{
                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800':
                      pair.in.flowType === '支出',
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800':
                      pair.in.flowType === '收入',
                    'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-600':
                      pair.in.flowType === '不计收支',
                  }"
                >
                  <div
                    class="text-xs font-semibold mb-1.5 flex items-center gap-1"
                    :class="{
                      'text-red-800 dark:text-red-300':
                        pair.in.flowType === '支出',
                      'text-green-800 dark:text-green-300':
                        pair.in.flowType === '收入',
                      'text-gray-800 dark:text-gray-300':
                        pair.in.flowType === '不计收支',
                    }"
                  >
                    <MinusIcon
                      v-if="pair.in.flowType === '支出'"
                      class="w-3 h-3"
                    />
                    <PlusIcon
                      v-else-if="pair.in.flowType === '收入'"
                      class="w-3 h-3"
                    />
                    <ScaleIcon v-else class="w-3 h-3" />
                    {{ pair.in.flowType }}
                  </div>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >金额</span
                      >
                      <span
                        class="font-medium text-xs"
                        :class="{
                          'text-red-600 dark:text-red-400':
                            pair.in.flowType === '支出',
                          'text-green-600 dark:text-green-400':
                            pair.in.flowType === '收入',
                          'text-gray-600 dark:text-gray-400':
                            pair.in.flowType === '不计收支',
                        }"
                        >{{ Number(pair.in.money).toFixed(2) }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >名称</span
                      >
                      <span
                        class="text-gray-900 dark:text-gray-100 text-[10px] truncate max-w-[60%]"
                        :title="pair.in.name"
                        >{{ pair.in.name }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >类型</span
                      >
                      <span
                        class="text-gray-900 dark:text-gray-100 text-[10px] truncate max-w-[60%]"
                        >{{ pair.in.industryType }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span
                        class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >{{
                          pair.in.flowType === "收入" ? "收款" : "支付"
                        }}</span
                      >
                      <span
                        class="text-gray-900 dark:text-gray-100 text-[10px] truncate max-w-[60%]"
                        >{{ pair.in.payType }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >日期</span
                      >
                      <span
                        class="text-gray-900 dark:text-gray-100 text-[10px]"
                        >{{ pair.in.day }}</span
                      >
                    </div>
                    <div
                      v-if="pair.in.description"
                      class="flex justify-between items-center"
                    >
                      <span class="text-gray-600 dark:text-gray-400 text-[10px]"
                        >备注</span
                      >
                      <span
                        class="text-gray-900 dark:text-gray-100 text-[10px] truncate max-w-[60%]"
                        :title="pair.in.description"
                        >{{ pair.in.description }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 - 紧凑布局 -->
              <div
                class="flex gap-2 mt-1 pt-1 border-t border-gray-200 dark:border-gray-600"
              >
                <button
                  @click="confirmBalance(pair)"
                  class="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
                >
                  <CheckIcon class="w-3 h-3" />
                  平账
                </button>
                <button
                  @click="ignoreBalance(pair)"
                  class="flex-1 px-2 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
                >
                  <EyeSlashIcon class="w-3 h-3" />
                  忽略
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  XMarkIcon,
  CheckIcon,
  EyeSlashIcon,
  AdjustmentsHorizontalIcon,
  MinusIcon,
  PlusIcon,
  ScaleIcon,
} from "@heroicons/vue/24/outline";
import { showAutoMergeFlowsDialog } from "~/utils/flag";

interface CandidatePair {
  out: Flow;
  in: Flow;
}

const candidatePairs = ref<CandidatePair[]>([]);
const loading = ref(false);

const fetchCandidates = () => {
  loading.value = true;
  doApi
    .post<CandidatePair[]>("api/entry/flow/condidate/autos", {
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      candidatePairs.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 初始化获取数据
fetchCandidates();

const confirmBalance = (pair: CandidatePair) => {
  Confirm.open({
    title: "平账确认",
    content: `确定要将下列数据平账吗？
    支出【${pair.out.industryType}-${pair.out.payType}: ${pair.out.money}】
    收入【${pair.in.industryType}-${pair.in.payType}: ${pair.in.money}】`,
    confirm: () => {
      doApi
        .post("api/entry/flow/condidate/confirm", {
          outId: pair.out.id,
          inIds: [pair.in.id],
          bookId: localStorage.getItem("bookId"),
        })
        .then((res) => {
          Alert.success("平账成功");
          // 重新加载候选数据
          fetchCandidates();
        })
        .catch((error) => {
          console.error("平账失败", error);
          Alert.error("平账失败");
        });
    },
  });
};

const ignoreBalance = (pair: CandidatePair) => {
  doApi
    .post("api/entry/flow/condidate/ignore", {
      id: pair.out.id,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      Alert.warning("已忽略");
      // 重新加载候选数据
      fetchCandidates();
    })
    .catch((error) => {
      console.error("忽略失败", error);
      Alert.error("忽略失败");
    });
};

const ignoreAllBalance = () => {
  if (candidatePairs.value.length <= 0) {
    Alert.error("没有可忽略的数据");
    return;
  }
  Confirm.open({
    title: "忽略确认",
    content: `确定要忽略 ${candidatePairs.value.length} 条数据吗？忽略后这些数据无法再使用自动平账！`,
    confirm: () => {
      doApi
        .post("api/entry/flow/condidate/ignoreAll", {
          bookId: localStorage.getItem("bookId"),
          ids: candidatePairs.value.map((p) => p.out.id),
        })
        .then((res) => {
          Alert.warning("已忽略");
          closeDialog();
        })
        .catch((error) => {
          console.error("忽略失败", error);
          Alert.error("忽略失败");
        });
    },
  });
};

const closeDialog = () => {
  showAutoMergeFlowsDialog.value = false;
};
</script>

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
