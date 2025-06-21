<template>
  <div
    class="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden rounded-lg"
  >
    <!-- 查询条件显示 -->
    <div
      class="px-2 py-1 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
    >
      <div class="flex flex-wrap gap-2 text-sm">
        <span
          v-if="flowQuery.startDay"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        >
          开始: {{ flowQuery.startDay }}
        </span>
        <span
          v-if="flowQuery.endDay"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        >
          结束: {{ flowQuery.endDay }}
        </span>
        <span
          v-if="flowQuery.flowType"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
        >
          {{ flowQuery.flowType }}
        </span>
        <span
          v-if="flowQuery.industryType"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        >
          {{ flowQuery.industryType }}
        </span>
        <span
          v-if="flowQuery.payType"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        >
          {{ flowQuery.payType }}
        </span>
        <span
          v-if="flowQuery.attribution"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        >
          {{ flowQuery.attribution }}
        </span>
        <span
          v-if="!hasFilters"
          class="text-gray-500 dark:text-gray-400 text-xs"
        >
          显示全部数据
        </span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
      <span class="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
    </div>

    <!-- 表格内容 -->
    <div v-else class="flow-container">
      <!-- 桌面端表格 -->
      <div
        class="hidden lg:block overflow-x-auto"
        :style="{ height: getTableHeight() + 'px' }"
      >
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr class="border-b border-gray-200 dark:border-gray-600">
              <th
                v-for="header in headers"
                :key="header.key"
                class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                :class="
                  header.key === 'money'
                    ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600'
                    : ''
                "
                @click="header.key === 'money' ? toggleSort() : null"
              >
                <div class="flex items-center gap-1">
                  {{ header.title }}
                  <div v-if="header.key === 'money'" class="flex flex-col">
                    <ChevronUpIcon
                      class="h-3 w-3"
                      :class="
                        flowQuery.moneySort === 'asc'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      "
                    />
                    <ChevronDownIcon
                      class="h-3 w-3 -mt-0.5"
                      :class="
                        flowQuery.moneySort === 'desc'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      "
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-gray-200 dark:divide-gray-600 overflow-y-auto"
          >
            <tr v-if="flowPageRef.data.length === 0">
              <td
                :colspan="headers.length"
                class="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                暂无数据
              </td>
            </tr>
            <tr
              v-else
              v-for="item in flowPageRef.data"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td
                class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
              >
                {{ item.day }}
              </td>
              <td
                class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
              >
                {{ item.flowType }}
              </td>
              <td
                class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 max-w-32 truncate"
                :title="item.industryType"
              >
                {{ item.industryType }}
              </td>
              <td
                class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 max-w-32 truncate"
                :title="item.payType"
              >
                {{ item.payType }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    Number(item.money) > 100
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                  ]"
                >
                  {{ Number(item.money || 0).toFixed(2) }}
                </span>
              </td>
              <td
                class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 max-w-32 truncate"
                :title="item.name"
              >
                {{ item.name }}
              </td>
              <td
                class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 max-w-32 truncate"
                :title="item.description"
              >
                {{ item.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 移动端卡片 -->
      <div
        class="lg:hidden overflow-y-auto"
        :style="{ height: getTableHeight() + 'px' }"
      >
        <div
          v-if="flowPageRef.data.length === 0"
          class="p-8 text-center text-gray-500 dark:text-gray-400"
        >
          暂无数据
        </div>
        <div
          v-else
          v-for="item in flowPageRef.data"
          :key="item.id"
          class="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h3 class="text-sm font-medium text-green-950 dark:text-white">
                {{ item.name }}
              </h3>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ item.day }}
              </p>
            </div>
            <span
              :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                Number(item.money) > 100
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
              ]"
            >
              {{ Number(item.money || 0).toFixed(2) }}
            </span>
          </div>
          <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p v-if="item.description">{{ item.description }}</p>
            <div class="flex flex-wrap gap-1">
              <span
                class="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded"
              >
                {{ item.flowType }}
              </span>
              <span
                class="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded"
              >
                {{ item.industryType }}
              </span>
              <span
                class="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded"
              >
                {{ item.payType }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="border-t border-gray-200 dark:border-gray-700"></div>

      <!-- 统计信息和分页 -->
      <div class="px-2 py-1 bg-gray-50 dark:bg-gray-700">
        <!-- 统计信息 -->
        <div class="flex flex-wrap gap-1 mb-2">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          >
            总收入: ¥{{ Number(flowPageRef.totalIn || 0).toFixed(2) }}
          </span>
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          >
            总支出: ¥{{ Number(flowPageRef.totalOut || 0).toFixed(2) }}
          </span>
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          >
            不计收支: ¥{{ Number(flowPageRef.notInOut || 0).toFixed(2) }}
          </span>
        </div>

        <!-- 分页控件 -->
        <div
          v-if="flowPageRef.total > (flowQuery.pageSize || 20)"
          class="flex flex-col gap-2"
        >
          <!-- 分页信息 -->
          <div class="text-sm text-gray-700 dark:text-gray-300 text-center">
            显示第 {{ (currentPage - 1) * (flowQuery.pageSize || 20) + 1 }} -
            {{
              Math.min(
                currentPage * (flowQuery.pageSize || 20),
                flowPageRef.total
              )
            }}
            条， 共 {{ flowPageRef.total }} 条记录
          </div>

          <!-- 分页操作 -->
          <div class="flex items-center justify-center gap-4">
            <!-- 每页显示数量 -->
            <select
              v-model="flowQuery.pageSize"
              @change="changePageSize"
              class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-green-950 dark:text-white"
            >
              <option value="10">10条/页</option>
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>

            <!-- 分页按钮 -->
            <div class="flex items-center gap-1">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage <= 1"
                class="p-1.5 sm:p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-green-950 dark:text-white transition-colors"
              >
                <ChevronLeftIcon class="h-3 w-3 sm:h-4 sm:w-4" />
              </button>

              <!-- 移动端友好的页码按钮 -->
              <template
                v-for="(page, index) in mobileFriendlyPageNumbers"
                :key="index"
              >
                <button
                  v-if="page !== '...'"
                  @click="changePage(Number(page))"
                  :class="[
                    'h-7 w-7 sm:h-8 sm:w-8 text-center text-xs sm:text-sm border rounded transition-colors',
                    page === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 bg-white dark:bg-gray-800 text-green-950 dark:text-white',
                  ]"
                >
                  {{ page }}
                </button>
                <span v-else class="px-1 text-gray-500 text-xs">...</span>
              </template>

              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="p-1.5 sm:p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-green-950 dark:text-white transition-colors"
              >
                <ChevronRightIcon class="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import { generateMobileFriendlyPageNumbers } from "~/utils/common";

const { query } = defineProps(["query"]);

const flowQuery = ref<FlowQuery>({ pageNum: 1, pageSize: 20, ...query });

const typeLabel = ref("支出/收入类型");
const payTypeLabel = ref("支付/收款方式");

const typeDefault = ["请先选择流水类型"];
// 消费类型/收入类型
const expenseTypeOptions = ref(typeDefault);
// 支付类型
const paymentTypeOptions = ref(typeDefault);

// 修改FlowType后联动
const changeTypes = () => {
  if (flowQuery.value.flowType === "支出") {
    typeLabel.value = "支出类型";
    payTypeLabel.value = "支付方式";
  } else if (flowQuery.value.flowType === "收入") {
    typeLabel.value = "收入类型";
    payTypeLabel.value = "收款方式";
  } else {
    typeLabel.value = "支出/收入类型";
    payTypeLabel.value = "支付/收款方式";
  }
  if (!flowQuery.value.flowType) {
    expenseTypeOptions.value = typeDefault;
    paymentTypeOptions.value = typeDefault;
    return;
  }
  getIndustryType(flowQuery.value.flowType).then((data) => {
    // @ts-ignore
    expenseTypeOptions.value = data.map((item) => {
      return item.value;
    });
  });
  getPayType(flowQuery.value.flowType).then((data) => {
    // @ts-ignore
    paymentTypeOptions.value = data.map((item) => {
      return { title: item.value };
    });
  });
};

const headers = ref([
  { title: "日期", key: "day", sortable: false },
  { title: "流水类型", key: "flowType", sortable: false },
  { title: "消费类型", key: "industryType", sortable: false },
  { title: "支付方式", key: "payType", sortable: false },
  { title: "金额", key: "money" },
  { title: "名称", key: "name", sortable: false },
  { title: "备注", key: "description", sortable: false },
]);

// 组件属性绑定
const loading = ref(true);
// 分页数据绑定
const flowPageRef = ref<Page<Flow>>({
  pageNum: 1,
  pageSize: 0,
  pages: 1,
  total: 0,
  totalOut: 0,
  totalIn: 0,
  notInOut: 0,
  data: [],
});

// 计算属性
const currentPage = computed(() => flowQuery.value.pageNum || 1);
const totalPages = computed(() =>
  Math.ceil((flowPageRef.value?.total || 0) / (flowQuery.value.pageSize || 20))
);

const hasFilters = computed(() => {
  return !!(
    flowQuery.value.startDay ||
    flowQuery.value.endDay ||
    flowQuery.value.flowType ||
    flowQuery.value.industryType ||
    flowQuery.value.payType ||
    flowQuery.value.attribution
  );
});

// 生成移动端友好的页码
const mobileFriendlyPageNumbers = computed(() => {
  return generateMobileFriendlyPageNumbers(
    currentPage.value,
    totalPages.value,
    3
  );
});

// 排序切换
const toggleSort = () => {
  if (!flowQuery.value.moneySort) {
    flowQuery.value.moneySort = "asc";
  } else if (flowQuery.value.moneySort === "asc") {
    flowQuery.value.moneySort = "desc";
  } else {
    flowQuery.value.moneySort = "";
  }
  doQuery();
};

// 分页操作
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  flowQuery.value.pageNum = page;
  doQuery();
};

const changePageSize = () => {
  flowQuery.value.pageNum = 1;
  doQuery();
};

// 执行分页数据查询
const doQuery = () => {
  loading.value = true;
  doApi
    .post<Page<Flow>>("api/entry/flow/page", {
      ...flowQuery.value,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      flowPageRef.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

changeTypes();

const getTableHeight = () => {
  return window.innerWidth < 1080
    ? window.innerHeight - 64 * 5.5
    : window.innerHeight - 64 * 6;
};

// 组件挂载时初始化数据
doQuery();
onMounted(() => {});

// 暴露方法给父组件调用
defineExpose({
  doQuery,
});
</script>

<style scoped>
.flow-container {
  min-height: 300px;
}

/* 自定义滚动条样式 */
.overflow-x-auto::-webkit-scrollbar,
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track,
.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-700;
}

.overflow-x-auto::-webkit-scrollbar-thumb,
.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover,
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
</style>
