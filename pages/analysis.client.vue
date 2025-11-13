<template>
  <div class="w-full">
    <!-- Content Area -->
    <div class="xl:max-w-[80vw] mx-auto w-full mt-2">
      <!-- Desktop & Tablet: Chart Carousel -->
      <div class="w-full" v-if="!loading">
        <div
          class="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-2 md:p-4 mb-4"
        >
          <!-- Chart Container -->
          <div
            class="w-full flex flex-col md:flex-row justify-between md:space-x-4 space-y-4 md:space-y-0 rounded-md p-2"
          >
            <div class="w-full border-b md:border-b-0 md:border-r">
              <DailyLineChart
                title="每日流水曲线"
                width="100%"
                height="300px"
              />
            </div>
            <div class="w-full">
              <MonthBar title="每月流水统计" width="100%" height="320px" />
            </div>
          </div>
        </div>
        <div
          class="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-2 md:p-4 mb-4"
        >
          <!-- Chart Container -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-green-950 dark:text-white">
              支出分析
            </h3>
            <!-- 图表类型切换 -->
            <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                @click="expenseChartType = 'pie'"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  expenseChartType === 'pie'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
                ]"
              >
                饼图
              </button>
              <button
                @click="expenseChartType = 'bar'"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  expenseChartType === 'bar'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
                ]"
              >
                柱图
              </button>
            </div>
          </div>

          <!-- 饼图展示 -->
          <div
            v-if="expenseChartType === 'pie'"
            class="w-full flex flex-col md:flex-row justify-between md:space-x-4 space-y-4 md:space-y-0 rounded-md p-2"
          >
            <div class="w-full border-b md:border-b-0 md:border-r">
              <ChartsCommonPie
                title="支付方式分析"
                width="100%"
                height="300px"
                groupBy="payType"
                flowType="支出"
                seriesName="支付方式"
                :showLegend="true"
                queryField="payType"
              />
            </div>
            <div class="w-full border-b md:border-b-0 md:border-r">
              <ChartsCommonPie
                title="消费类型分析"
                width="100%"
                height="300px"
                groupBy="industryType"
                flowType="支出"
                seriesName="消费类型"
                :showLegend="true"
                queryField="industryType"
              />
            </div>
            <div class="w-full">
              <ChartsCommonPie
                title="消费归属分析"
                width="100%"
                height="300px"
                groupBy="attribution"
                flowType="支出"
                seriesName="消费归属"
                :showLegend="true"
                queryField="attribution"
              />
            </div>
          </div>

          <!-- 柱图展示 -->
          <div
            v-if="expenseChartType === 'bar'"
            class="w-full flex flex-col md:flex-row justify-between md:space-x-4 space-y-4 md:space-y-0 rounded-md p-2"
          >
            <div class="w-full border-b md:border-b-0 md:border-r">
              <ChartsCommonBar
                title="支付方式分析"
                width="100%"
                height="300px"
                groupBy="payType"
                flowType="支出"
                seriesName="支付方式"
                :showLegend="true"
                queryField="payType"
              />
            </div>
            <div class="w-full border-b md:border-b-0 md:border-r">
              <ChartsCommonBar
                title="消费类型分析"
                width="100%"
                height="300px"
                groupBy="industryType"
                flowType="支出"
                seriesName="消费类型"
                :showLegend="true"
                queryField="industryType"
              />
            </div>
            <div class="w-full">
              <ChartsCommonBar
                title="消费归属分析"
                width="100%"
                height="300px"
                groupBy="attribution"
                flowType="支出"
                seriesName="消费归属"
                :showLegend="true"
                queryField="attribution"
              />
            </div>
          </div>
        </div>
        <div
          class="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-2 md:p-4 mb-4"
        >
          <!-- Chart Container -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-green-950 dark:text-white">
              收入分析
            </h3>
            <!-- 图表类型切换 -->
            <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                @click="incomeChartType = 'pie'"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  incomeChartType === 'pie'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
                ]"
              >
                饼图
              </button>
              <button
                @click="incomeChartType = 'bar'"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  incomeChartType === 'bar'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
                ]"
              >
                柱图
              </button>
            </div>
          </div>

          <!-- 饼图展示 -->
          <div
            v-if="incomeChartType === 'pie'"
            class="w-full flex flex-col md:flex-row justify-between md:space-x-4 space-y-4 md:space-y-0 rounded-md p-2"
          >
            <div class="w-full border-b md:border-b-0 md:border-r">
              <ChartsCommonPie
                title="收款方式分析"
                width="100%"
                height="300px"
                groupBy="payType"
                flowType="收入"
                seriesName="收款方式"
                :showLegend="true"
                queryField="payType"
              />
            </div>
            <div class="w-full border-b md:border-b-0 md:border-r">
              <ChartsCommonPie
                title="收入类型分析"
                width="100%"
                height="300px"
                groupBy="industryType"
                flowType="收入"
                seriesName="收入类型"
                :showLegend="true"
                queryField="industryType"
              />
            </div>
            <div class="w-full">
              <ChartsCommonPie
                title="收入归属分析"
                width="100%"
                height="300px"
                groupBy="attribution"
                flowType="收入"
                seriesName="收入归属"
                :showLegend="true"
                queryField="attribution"
              />
            </div>
          </div>

          <!-- 柱图展示 -->
          <div
            v-if="incomeChartType === 'bar'"
            class="w-full flex flex-col md:flex-row justify-between md:space-x-4 space-y-4 md:space-y-0 rounded-md p-2"
          >
            <div class="w-full border-b md:border-b-0 md:border-r">
              <ChartsCommonBar
                title="收款方式分析"
                width="100%"
                height="300px"
                groupBy="payType"
                flowType="收入"
                seriesName="收款方式"
                :showLegend="true"
                queryField="payType"
              />
            </div>
            <div class="w-full border-b md:border-b-0 md:border-r">
              <ChartsCommonBar
                title="收入类型分析"
                width="100%"
                height="300px"
                groupBy="industryType"
                flowType="收入"
                seriesName="收入类型"
                :showLegend="true"
                queryField="industryType"
              />
            </div>
            <div class="w-full">
              <ChartsCommonBar
                title="收入归属分析"
                width="100%"
                height="300px"
                groupBy="attribution"
                flowType="收入"
                seriesName="收入归属"
                :showLegend="true"
                queryField="attribution"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TagIcon,
  CreditCardIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";

definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import MobileChartCard from "~/components/charts/MobileChartCard.vue";
import DailyLineChart from "~/components/charts/DailyLineChart.vue";
import MonthBar from "~/components/charts/MonthBar.vue";

const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1200
);

// 图表类型切换状态
const expenseChartType = ref<"pie" | "bar">("pie");
const incomeChartType = ref<"pie" | "bar">("pie");

// 轮播图相关状态
const currentCarouselIndex = ref(0);
const carouselCharts = [
  { name: "支出类型统计" },
  { name: "支付方式统计" },
  { name: "流水归属统计" },
  { name: "每日流水统计" },
  { name: "每月流水统计" },
];

// 响应式图表尺寸计算

// Mobile charts (horizontal scroll)
const mobileChartWidth = computed(() => "100%");
const mobileChartHeight = computed(() => "62vh");

// 窗口大小变化监听
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// 移动端交互处理
const handleMobileFilter = (type: string) => {
  console.log(`Filter for ${type}`);
  // 这里可以实现具体的筛选逻辑
};

const handleMobileDetails = (type: string) => {
  console.log(`Details for ${type}`);
  // 这里可以实现跳转到详情页面的逻辑
  const chartMap: { [key: string]: number } = {
    industry: 0,
    payType: 1,
    attribution: 2,
    daily: 3,
    monthly: 4,
  };
  if (chartMap[type] !== undefined) {
    currentCarouselIndex.value = chartMap[type];
  }
};

// 轮播图导航函数 - 循环轮播
const prevChart = () => {
  if (currentCarouselIndex.value > 0) {
    currentCarouselIndex.value--;
  } else {
    // 从第一个跳到最后一个
    currentCarouselIndex.value = carouselCharts.length - 1;
  }
};

const nextChart = () => {
  if (currentCarouselIndex.value < carouselCharts.length - 1) {
    currentCarouselIndex.value++;
  } else {
    // 从最后一个跳到第一个
    currentCarouselIndex.value = 0;
  }
};

const goToChart = (index: number) => {
  currentCarouselIndex.value = index;
};

const loading = ref(true);
onMounted(async () => {
  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleResize);
  }
  // 等待DOM完全渲染
  await nextTick();
  loading.value = false;
});

onBeforeUnmount(() => {
  // 清理资源
  loading.value = true;
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", handleResize);
  }
});
</script>

<style scoped>
/* 自定义样式 */
.max-w-7xl {
  max-width: 1280px;
}

/* 确保图表容器的响应式 */
:deep(.chart-common-container) {
  width: 100% !important;
}

/* 移动端水平滚动样式 */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: theme("colors.gray.300") transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: theme("colors.gray.300");
  border-radius: 3px;
}

.dark .overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: theme("colors.gray.600");
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

/* 移动端卡片滚动动画 */
@media (max-width: 1024px) {
  .snap-x {
    scroll-behavior: smooth;
  }
}
</style>
