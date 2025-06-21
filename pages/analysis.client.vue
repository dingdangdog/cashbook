<template>
  <div class="w-full">
    <!-- Content Area -->
    <div class="md:max-w-[80vw] mx-auto mt-2">
      <!-- Desktop & Tablet: Chart Carousel -->
      <div class="hidden md:block">
        <div
          class="px-2 relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <!-- Chart Container -->
          <div class="relative overflow-hidden rounded-lg">
            <div
              class="flex transition-transform duration-300 ease-in-out"
              :style="{
                transform: `translateX(-${currentCarouselIndex * 100}%)`,
              }"
            >
              <!-- Chart 1: Industry Type -->
              <div class="w-full flex-shrink-0">
                <IndustryTypePie
                  :title="'支出类型统计'"
                  :width="carouselChartWidth"
                  :height="carouselChartHeight"
                />
              </div>

              <!-- Chart 2: Pay Type -->
              <div class="w-full flex-shrink-0">
                <PayTypePie
                  :title="'支付方式统计'"
                  :width="carouselChartWidth"
                  :height="carouselChartHeight"
                />
              </div>

              <!-- Chart 3: Attribution -->
              <div class="w-full flex-shrink-0">
                <AttributionPie
                  :title="'流水归属统计'"
                  :width="carouselChartWidth"
                  :height="carouselChartHeight"
                />
              </div>

              <!-- Chart 4: Daily Line -->
              <div class="w-full flex-shrink-0">
                <DailyLineChart
                  :title="'每日流水统计'"
                  :width="carouselChartWidth"
                  :height="carouselChartHeight"
                />
              </div>

              <!-- Chart 5: Month Bar -->
              <div class="w-full flex-shrink-0">
                <MonthBar
                  :title="'每月流水统计'"
                  :width="carouselChartWidth"
                  :height="carouselChartHeight"
                />
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <button
            @click="prevChart"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/60 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-full p-2 shadow-lg hover:bg-gray-50/50 dark:hover:bg-gray-600/50 transition-colors z-10"
          >
            <svg
              class="w-5 h-5 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            @click="nextChart"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/60 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-full p-2 shadow-lg hover:bg-gray-50/50 dark:hover:bg-gray-600/50 transition-colors z-10"
          >
            <svg
              class="w-5 h-5 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- Indicators -->
          <div
            class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
          >
            <button
              v-for="(chart, index) in carouselCharts"
              :key="index"
              @click="goToChart(index)"
              class="w-3 h-3 rounded-full transition-colors"
              :class="[
                currentCarouselIndex === index
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500',
              ]"
            ></button>
          </div>

          <!-- Chart Info -->
          <div
            class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ currentCarouselIndex + 1 }} / {{ carouselCharts.length }} -
            {{ carouselCharts[currentCarouselIndex].name }}
          </div>
        </div>
      </div>

      <!-- Mobile: Chart Cards (Always Show) -->
      <div class="block md:hidden px-2">
        <div
          class="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory px-2"
        >
          <MobileChartCard
            title="支出类型"
            :icon="TagIcon"
            :current-index="0"
            :total-count="5"
            chart-type="industry"
            :chart-width="mobileChartWidth"
            :chart-height="mobileChartHeight"
            @filter="handleMobileFilter('industry')"
            @details="handleMobileDetails('industry')"
          />

          <MobileChartCard
            title="支付方式"
            :icon="CreditCardIcon"
            :current-index="1"
            :total-count="5"
            chart-type="paytype"
            :chart-width="mobileChartWidth"
            :chart-height="mobileChartHeight"
            @filter="handleMobileFilter('payType')"
            @details="handleMobileDetails('payType')"
          />

          <MobileChartCard
            title="归属统计"
            :icon="UserGroupIcon"
            :current-index="2"
            :total-count="5"
            chart-type="attribution"
            :chart-width="mobileChartWidth"
            :chart-height="mobileChartHeight"
            @filter="handleMobileFilter('attribution')"
            @details="handleMobileDetails('attribution')"
          />

          <MobileChartCard
            title="每日流水"
            :icon="ChartBarIcon"
            :current-index="3"
            :total-count="5"
            chart-type="daily"
            :chart-width="mobileChartWidth"
            :chart-height="mobileChartHeight"
            @filter="handleMobileFilter('daily')"
            @details="handleMobileDetails('daily')"
          />

          <MobileChartCard
            title="每月流水"
            :icon="CalendarIcon"
            :current-index="4"
            :total-count="5"
            chart-type="month"
            :chart-width="mobileChartWidth"
            :chart-height="mobileChartHeight"
            @filter="handleMobileFilter('monthly')"
            @details="handleMobileDetails('monthly')"
          />
        </div>

        <!-- Enhanced Mobile Navigation -->
        <div class="flex justify-center items-center mt-2">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            左右滑动切换图表
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
  defineAsyncComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
} from "vue";
import AttributionPie from "~/components/charts/AttributionPie.vue";
import MobileChartCard from "~/components/charts/MobileChartCard.vue";

// 异步组件引用
const DailyLineChart = defineAsyncComponent(
  () => import("~/components/charts/DailyLineChart.vue")
);
const IndustryTypePie = defineAsyncComponent(
  () => import("~/components/charts/IndustryTypePie.vue")
);
const PayTypePie = defineAsyncComponent(
  () => import("~/components/charts/PayTypePie.vue")
);
const MonthBar = defineAsyncComponent(
  () => import("~/components/charts/MonthBar.vue")
);

const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1200
);

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

// Carousel charts (larger size for better viewing)
const carouselChartWidth = computed(() => "100%");
const carouselChartHeight = computed(() => {
  if (windowWidth.value < 768) {
    return "70vh";
  } else if (windowWidth.value < 1024) {
    return "70vh";
  } else {
    return "80vh";
  }
});

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

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleResize);
  }
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
@media (max-width: 768px) {
  .snap-x {
    scroll-behavior: smooth;
  }
}
</style>
