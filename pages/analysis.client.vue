<template>
  <div
    class="tw-w-full tw-bg-gray-50 dark:tw-bg-gray-900 tw-transition-colors tw-duration-200"
  >
    <!-- Tab Navigation - Desktop Only -->
    <div
      class="tw-bg-white dark:tw-bg-gray-800 tw-shadow-sm tw-border-b tw-border-gray-200 dark:tw-border-gray-700 tw-sticky tw-top-0 tw-z-10 tw-hidden md:tw-block"
    >
      <div class="tw-max-w-7xl tw-mx-auto tw-px-4">
        <nav
          class="tw-flex tw-flex-wrap tw-justify-center tw-space-x-2 tw-py-4"
        >
          <button
            v-for="(tab, index) in tabs"
            :key="index"
            @click="chartTab = index"
            :class="[
              'tw-px-3 sm:tw-px-4 tw-py-2 tw-text-sm sm:tw-text-base tw-font-medium tw-rounded-lg tw-transition-all tw-duration-200',
              'tw-border tw-border-transparent',
              'hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700',
              'focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-green-500 focus:tw-ring-offset-2',
              chartTab === index
                ? 'tw-bg-green-500 tw-text-white tw-shadow-md hover:tw-bg-green-600'
                : 'tw-text-gray-700 dark:tw-text-gray-300',
            ]"
          >
            <component
              :is="tab.icon"
              class="tw-w-4 tw-h-4 tw-inline-block tw-mr-1 sm:tw-mr-2"
            />
            <span class="tw-hidden sm:tw-inline">{{ tab.label }}</span>
            <span class="tw-inline sm:tw-hidden">{{ tab.shortLabel }}</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Content Area -->
    <div class="tw-max-w-7xl tw-mx-auto">
      <!-- All Charts Tab -->
      <div v-if="chartTab === 0" class="tw-mt-2 tw-space-y-2">
        <!-- Desktop: 2x2 Grid -->
        <div class="tw-hidden lg:tw-grid tw-grid-cols-2 tw-gap-2">
          <div
            class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700"
          >
            <IndustryTypePie
              :title="'支出类型统计'"
              :width="desktopChartWidth"
              :height="desktopChartHeight"
            />
          </div>
          <div
            class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700"
          >
            <PayTypePie
              :title="'支付方式统计'"
              :width="desktopChartWidth"
              :height="desktopChartHeight"
            />
          </div>
          <div
            class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700"
          >
            <DailyLineChart
              :title="'每日流水统计'"
              :width="desktopChartWidth"
              :height="desktopChartHeight"
            />
          </div>
          <div
            class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700"
          >
            <MonthBar
              :title="'每月流水统计'"
              :width="desktopChartWidth"
              :height="desktopChartHeight"
            />
          </div>
        </div>

        <!-- Tablet: Single Column -->
        <div class="tw-hidden md:tw-block lg:tw-hidden tw-space-y-2">
          <div
            class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700"
          >
            <IndustryTypePie
              :title="'支出类型统计'"
              :width="tabletChartWidth"
              :height="tabletChartHeight"
            />
          </div>
          <div
            class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700"
          >
            <PayTypePie
              :title="'支付方式统计'"
              :width="tabletChartWidth"
              :height="tabletChartHeight"
            />
          </div>
          <div
            class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700"
          >
            <DailyLineChart
              :title="'每日流水统计'"
              :width="tabletChartWidth"
              :height="tabletChartHeight"
            />
          </div>
          <div
            class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700"
          >
            <MonthBar
              :title="'每月流水统计'"
              :width="tabletChartWidth"
              :height="tabletChartHeight"
            />
          </div>
        </div>

        <!-- Mobile: Chart Cards (Always Show) -->
        <div class="tw-block md:tw-hidden">
          <div
            class="tw-flex tw-overflow-x-auto tw-space-x-4 tw-pb-4 tw-snap-x tw-snap-mandatory tw-px-4"
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
          <div class="tw-flex tw-justify-center tw-items-center tw-mt-2">
            <div class="tw-text-xs tw-text-gray-500 dark:tw-text-gray-400">
              左右滑动查看更多
            </div>
          </div>
        </div>
      </div>

      <!-- Individual Chart Tabs - Desktop Only -->
      <div
        v-else
        class="tw-mt-2 tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700 tw-hidden md:tw-block"
      >
        <IndustryTypePie
          v-if="chartTab === 1"
          :title="''"
          :width="singleChartWidth"
          :height="singleChartHeight"
        />
        <PayTypePie
          v-if="chartTab === 2"
          :title="''"
          :width="singleChartWidth"
          :height="singleChartHeight"
        />
        <DailyLineChart
          v-if="chartTab === 3"
          :title="''"
          :width="singleChartWidth"
          :height="singleChartHeight"
        />
        <MonthBar
          v-if="chartTab === 4"
          :title="''"
          :width="singleChartWidth"
          :height="singleChartHeight"
        />
        <AttributionPie
          v-if="chartTab === 5"
          :title="''"
          :width="singleChartWidth"
          :height="singleChartHeight"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Squares2X2Icon,
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

// 借用全屏标志，用于判断时不是小屏模式
import { miniFullscreen } from "@/utils/common";
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

// Tab configuration
const tabs = [
  {
    label: "全部",
    shortLabel: "全部",
    icon: Squares2X2Icon,
  },
  {
    label: "支出类型统计",
    shortLabel: "类型",
    icon: TagIcon,
  },
  {
    label: "支付方式统计",
    shortLabel: "支付",
    icon: CreditCardIcon,
  },
  {
    label: "每日流水统计",
    shortLabel: "每日",
    icon: ChartBarIcon,
  },
  {
    label: "每月流水统计",
    shortLabel: "每月",
    icon: CalendarIcon,
  },
  {
    label: "流水归属统计",
    shortLabel: "归属",
    icon: UserGroupIcon,
  },
];

const chartTab = ref(0);
const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1200
);

// 响应式图表尺寸计算
const singleChartWidth = computed(() => {
  if (windowWidth.value < 640) {
    return "100%";
  } else if (windowWidth.value < 1024) {
    return "100%";
  } else {
    return "100%";
  }
});

const singleChartHeight = computed(() => {
  if (windowWidth.value < 640) {
    return "400px";
  } else if (windowWidth.value < 1024) {
    return "500px";
  } else {
    return "600px";
  }
});

// Desktop charts (2x2 grid)
const desktopChartWidth = computed(() => "100%");
const desktopChartHeight = computed(() => "400px");

// Tablet charts (single column)
const tabletChartWidth = computed(() => "100%");
const tabletChartHeight = computed(() => "450px");

// Mobile charts (horizontal scroll)
const mobileChartWidth = computed(() => "100%");
const mobileChartHeight = computed(() => "58vh");

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
  const tabMap: { [key: string]: number } = {
    industry: 1,
    payType: 2,
    daily: 3,
    monthly: 4,
  };
  if (tabMap[type] !== undefined) {
    chartTab.value = tabMap[type];
  }
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
.tw-max-w-7xl {
  max-width: 1280px;
}

/* 确保图表容器的响应式 */
:deep(.chart-common-container) {
  width: 100% !important;
}

/* 移动端水平滚动样式 */
.tw-overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: theme("colors.gray.300") transparent;
}

.tw-overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.tw-overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.tw-overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: theme("colors.gray.300");
  border-radius: 3px;
}

.dark .tw-overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: theme("colors.gray.600");
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  @apply tw-bg-gray-100 dark:tw-bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply tw-bg-gray-300 dark:tw-bg-gray-600 tw-rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply tw-bg-gray-400 dark:tw-bg-gray-500;
}

/* 移动端卡片滚动动画 */
@media (max-width: 768px) {
  .tw-snap-x {
    scroll-behavior: smooth;
  }
}
</style>
