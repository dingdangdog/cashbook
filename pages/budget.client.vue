<template>
  <div class="p-2 md:p-4 bg-gray-50 dark:bg-green-950/20 min-h-full">
    <!-- 月份选择和操作栏 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-3"
    >
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div class="flex items-center gap-3">
          <h1 class="text-lg font-semibold text-green-950 dark:text-white">预算管理</h1>
          <select
            v-model="selectedMonth"
            @change="loadData"
            class="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-green-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="month in monthOptions" :key="month.value" :value="month.value">
              {{ month.title }}
            </option>
          </select>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button
            @click="openBudgetDialog"
            class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <CogIcon class="h-4 w-4" />
            设置预算
          </button>
          <button
            @click="reloadUsedAmount"
            class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <ArrowPathIcon class="h-4 w-4" />
            刷新额度
          </button>
        </div>
      </div>
    </div>

    <!-- 预算概览卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
      <!-- 月度预算总额 -->
      <div class="bg-blue-600 text-white rounded-lg p-3 shadow-sm">
        <div class="text-xs opacity-90 mb-1">月度预算总额</div>
        <div class="text-lg md:text-xl font-bold">{{ formatCurrency(totalBudget) }}</div>
      </div>

      <!-- 固定支出 -->
      <div class="bg-orange-600 text-white rounded-lg p-3 shadow-sm">
        <div class="text-xs opacity-90 mb-1">固定支出</div>
        <div class="text-lg md:text-xl font-bold">{{ formatCurrency(fixedFlowTotal) }}</div>
      </div>

      <!-- 可用额度 -->
      <div class="bg-purple-600 text-white rounded-lg p-3 shadow-sm">
        <div class="text-xs opacity-90 mb-1">可用额度</div>
        <div class="text-lg md:text-xl font-bold">{{ formatCurrency(availableAmount) }}</div>
        <div class="text-xs opacity-80">({{ availablePercentage }}%)</div>
      </div>

      <!-- 已用额度 -->
      <div class="bg-red-600 text-white rounded-lg p-3 shadow-sm">
        <div class="text-xs opacity-90 mb-1">已用额度</div>
        <div class="text-lg md:text-xl font-bold">{{ formatCurrency(usedAmount) }}</div>
        <div class="text-xs opacity-80">({{ usedPercentage }}%)</div>
      </div>

      <!-- 剩余额度 -->
      <div class="bg-green-600 text-white rounded-lg p-3 shadow-sm">
        <div class="text-xs opacity-90 mb-1">剩余额度</div>
        <div class="text-lg md:text-xl font-bold">{{ formatCurrency(remainingAmount) }}</div>
        <div class="text-xs opacity-80">({{ remainingPercentage }}%)</div>
      </div>
    </div>

    <!-- 固定支出管理 -->
    <div
      class="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden rounded-lg"
    >
      <!-- 标题栏 -->
      <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-green-950 dark:text-white">固定支出管理</h2>
          <button
            @click="openFixedFlowDialog()"
            class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <PlusIcon class="h-4 w-4" />
            添加支出
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>

      <!-- 桌面端表格 -->
      <div v-if="!loading && fixedFlows.length" class="hidden lg:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">月份</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">名称</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">金额</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">归属</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">备注</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
            <tr
              v-for="item in fixedFlows"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ item.startMonth }} ~ {{ item.endMonth }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-green-950 dark:text-white">
                {{ item.name }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  {{ formatCurrency(item.money || 0) }}
                </span>
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ item.attribution || '-' }}
              </td>
              <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 max-w-48 truncate">
                {{ item.description || '-' }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="openFixedFlowDialog(item)"
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="编辑"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="deleteFixedFlow(item)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="删除"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 移动端卡片 -->
      <div v-if="!loading && fixedFlows.length" class="lg:hidden max-h-[50vh] overflow-y-auto">
        <div
          v-for="item in fixedFlows"
          :key="item.id"
          class="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h3 class="text-sm font-medium text-green-950 dark:text-white">{{ item.name }}</h3>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ item.startMonth }} ~ {{ item.endMonth }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {{ formatCurrency(item.money || 0) }}
              </span>
              <div class="flex gap-1">
                <button
                  @click="openFixedFlowDialog(item)"
                  class="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  title="编辑"
                >
                  <PencilIcon class="h-3 w-3" />
                </button>
                <button
                  @click="deleteFixedFlow(item)"
                  class="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  title="删除"
                >
                  <TrashIcon class="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
          <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p v-if="item.attribution">
              <span class="font-medium">归属:</span> {{ item.attribution }}
            </p>
            <p v-if="item.description">
              <span class="font-medium">备注:</span> {{ item.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && (!fixedFlows || fixedFlows.length === 0)" class="text-center py-12">
        <div class="text-gray-400 dark:text-gray-500 mb-4">
          <CurrencyDollarIcon class="mx-auto h-12 w-12" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">暂无固定支出</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">开始添加您的固定支出吧</p>
        <button
          @click="openFixedFlowDialog()"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
        >
          <PlusIcon class="h-4 w-4" />
          添加固定支出
        </button>
      </div>
    </div>

    <!-- 预算设置对话框 -->
    <div v-if="budgetDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-green-950 dark:text-white">设置月度预算</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                预算金额
              </label>
              <input
                v-model="editedBudget.budget"
                type="number"
                placeholder="请输入预算金额"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex gap-3 justify-end">
          <button
            @click="budgetDialog = false"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="saveBudget"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 固定支出对话框 -->
    <div v-if="fixedFlowDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-green-950 dark:text-white">
            {{ editedFixedFlow.id ? '编辑' : '添加' }}固定支出
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                开始月份(包含)
              </label>
              <select
                v-model="editedFixedFlow.startMonth"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-green-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择开始月份</option>
                <option v-for="month in monthOptions" :key="month.value" :value="month.value">
                  {{ month.title }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                结束月份(包含)
              </label>
              <select
                v-model="editedFixedFlow.endMonth"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-green-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择结束月份</option>
                <option v-for="month in monthOptions" :key="month.value" :value="month.value">
                  {{ month.title }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                名称
              </label>
              <input
                v-model="editedFixedFlow.name"
                type="text"
                placeholder="请输入支出名称"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                金额
              </label>
              <input
                v-model="editedFixedFlow.money"
                type="number"
                placeholder="请输入金额"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                流水归属
              </label>
              <select
                v-model="editedFixedFlow.attribution"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-green-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择归属</option>
                <option v-for="attr in attributionList" :key="attr" :value="attr">
                  {{ attr }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                备注
              </label>
              <textarea
                v-model="editedFixedFlow.description"
                rows="3"
                placeholder="请输入备注信息"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex gap-3 justify-end">
          <button
            @click="fixedFlowDialog = false"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="saveFixedFlow"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="confirmDeleteDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">确认删除</h3>
        </div>
        <div class="p-6">
          <p class="text-gray-700 dark:text-gray-300">
            您确定要删除这个固定支出吗？此操作不可撤销。
          </p>
        </div>
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex gap-3 justify-end">
          <button
            @click="confirmDeleteDialog = false"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
} from "@heroicons/vue/24/outline";

// 需要登录
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

const bookId = localStorage.getItem("bookId");

// Data
const loading = ref(false);
const selectedMonth = ref(getCurrentMonth());
const budgetSummary = ref<Budget>({});
const fixedFlows = ref<FixedFlow[]>([]);

// 预算总额
const totalBudget = computed(() => budgetSummary.value.budget || 0);

// 固定支出总额
const fixedFlowTotal = computed(() => {
  return fixedFlows.value.reduce(
    (total, item) => total + (Number(item.money) || 0),
    0
  );
});

// 可用额度
const availableAmount = computed(
  () => totalBudget.value - fixedFlowTotal.value
);

// 已用额度
const usedAmount = computed(() => budgetSummary.value.used || 0);

// 剩余额度
const remainingAmount = computed(
  () => availableAmount.value - usedAmount.value
);

// 已用额度百分比
const usedPercentage = computed(() => {
  return calculatePercentage(usedAmount.value, totalBudget.value);
});

// 可用额度百分比
const availablePercentage = computed(() => {
  return calculatePercentage(availableAmount.value, totalBudget.value);
});

// 剩余额度百分比
const remainingPercentage = computed(() => {
  return calculatePercentage(remainingAmount.value, totalBudget.value);
});

// Dialogs
const budgetDialog = ref(false);
const fixedFlowDialog = ref(false);
const confirmDeleteDialog = ref(false);

// Edited items
const editedBudget = ref({ budget: 0 });
const editedFixedFlow = ref<FixedFlow>({});
const itemToDelete = ref<FixedFlow | null>(null);

// Options for selects
const monthOptions = generateMonthOptions();
const attributionList = ref<string[]>([]);
const getAttributions = async () => {
  const res = await doApi.post<string[]>("api/entry/flow/getAttributions", {
    bookId: localStorage.getItem("bookId"),
  });
  attributionList.value = res;
};
getAttributions();

// Lifecycle hooks
onMounted(() => {
  loadData();
});

// Methods
function loadData() {
  if (!bookId) {
    Alert.error("请先选择账本");
    return;
  }

  loading.value = true;

  // 加载预算数据
  doApi
    .post<Budget[]>("api/entry/budget/list", {
      bookId: bookId,
      month: selectedMonth.value,
    })
    .then((res) => {
      if (res && res.length > 0) {
        budgetSummary.value = res[0];
      } else {
        budgetSummary.value = { budget: 0, used: 0 };
      }
    })
    .catch((err) => {
      console.error("Failed to load budget data:", err);
      Alert.error("加载预算数据失败");
    });

  // 加载固定支出数据
  doApi
    .post<FixedFlow[]>("api/entry/fixedFlow/list", {
      bookId: bookId,
      month: selectedMonth.value,
    })
    .then((res) => {
      fixedFlows.value = res || [];
    })
    .catch((err) => {
      console.error("Failed to load fixed flow data:", err);
      Alert.error("加载固定支出数据失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

function openBudgetDialog() {
  editedBudget.value = {
    budget: budgetSummary.value.budget || 0,
  };
  budgetDialog.value = true;
}

const reloadUsedAmount = () => {
  doApi
    .post("api/entry/budget/reloadUsedAmount", {
      bookId: bookId,
      month: selectedMonth.value,
    })
    .then((res) => {
      Alert.success("已用额度刷新成功");
      loadData();
    });
};

function saveBudget() {
  if (!editedBudget.value.budget) {
    Alert.error("预算金额不能为空");
    return;
  }
  loading.value = true;

  const data = {
    bookId: bookId,
    month: selectedMonth.value,
    budget: Number(editedBudget.value.budget),
  };

  if (budgetSummary.value.id) {
    // Update existing budget
    doApi
      .post("api/entry/budget/update", {
        ...data,
        id: budgetSummary.value.id,
      })
      .then(() => {
        Alert.success("预算更新成功");
        budgetDialog.value = false;
        loadData();
      })
      .catch((err) => {
        console.error("Failed to update budget:", err);
        Alert.error("预算更新失败");
      })
      .finally(() => {
        loading.value = false;
      });
  } else {
    // Create new budget
    doApi
      .post("api/entry/budget/add", data)
      .then(() => {
        Alert.success("预算设置成功");
        budgetDialog.value = false;
        loadData();
      })
      .catch((err) => {
        console.error("Failed to add budget:", err);
        Alert.error("预算设置失败");
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

function openFixedFlowDialog(item: FixedFlow | null = null) {
  if (item) {
    editedFixedFlow.value = { ...item };
  } else {
    editedFixedFlow.value = {};
  }
  fixedFlowDialog.value = true;
}

function saveFixedFlow() {
  if (!editedFixedFlow.value.money) {
    Alert.error("金额不能为空");
    return;
  }
  loading.value = true;

  const data = {
    ...editedFixedFlow.value,
    bookId: bookId,
    month: selectedMonth.value,
    money: Number(editedFixedFlow.value.money),
  };

  if (editedFixedFlow.value.id) {
    // Update existing fixed flow
    doApi
      .post("api/entry/fixedFlow/update", data)
      .then(() => {
        Alert.success("固定支出更新成功");
        fixedFlowDialog.value = false;
        loadData();
      })
      .catch((err) => {
        console.error("Failed to update fixed flow:", err);
        Alert.error("固定支出更新失败");
      })
      .finally(() => {
        loading.value = false;
      });
  } else {
    // Create new fixed flow
    doApi
      .post("api/entry/fixedFlow/add", data)
      .then(() => {
        Alert.success("固定支出添加成功");
        fixedFlowDialog.value = false;
        loadData();
      })
      .catch((err) => {
        console.error("Failed to add fixed flow:", err);
        Alert.error("固定支出添加失败");
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

function deleteFixedFlow(item: FixedFlow) {
  itemToDelete.value = item;
  confirmDeleteDialog.value = true;
}

function confirmDelete() {
  if (!itemToDelete.value) return;

  loading.value = true;

  doApi
    .post("api/entry/fixedFlow/del", {
      id: itemToDelete.value.id,
      bookId: bookId,
    })
    .then(() => {
      Alert.success("固定支出删除成功");
      confirmDeleteDialog.value = false;
      loadData();
    })
    .catch((err) => {
      console.error("Failed to delete fixed flow:", err);
      Alert.error("固定支出删除失败");
    })
    .finally(() => {
      loading.value = false;
      itemToDelete.value = null;
    });
}

// Utility functions
function getCurrentMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function generateMonthOptions() {
  const options = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Generate options for the current year and previous year
  for (let year = currentYear + 2; year >= currentYear - 1; year--) {
    for (let month = 12; month >= 1; month--) {
      const monthStr = String(month).padStart(2, "0");
      options.unshift({
        title: `${year}-${monthStr}`,
        value: `${year}-${monthStr}`,
      });
    }
  }

  return options;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(value);
}

function calculatePercentage(used: number, total: number) {
  if (!total || total === 0) return 0;
  const percentage = (used / total) * 100;
  return Math.min(percentage, 100).toFixed(1);
}
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
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
