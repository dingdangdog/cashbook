<template>
  <div class="bg-gray-50 dark:bg-gray-900 p-0 md:p-4">
    <!-- Header Section -->
    <div class="max-w-7xl mx-auto">
      <!-- Summary Cards -->
      <div
        class="grid grid-cols-3 gap-2 md:gap-4 mb-4 mx-2 md:mx-0 mt-4 md:mt-0"
      >
        <!-- Income Card -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-lg p-2 md:p-4 border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
          @click="clickDay('', '收入')"
        >
          <div class="flex items-center flex-row space-x-2">
            <div class="flex-shrink-0 mb-0">
              <div
                class="w-8 h-8 md:w-12 md:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center"
              >
                <ArrowTrendingUpIcon
                  class="w-4 h-4 md:w-6 md:h-6 text-green-700 dark:text-green-300"
                />
              </div>
            </div>
            <div class="md:ml-4 text-center md:text-left">
              <p
                class="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                总收入
              </p>
              <p
                class="text-sm md:text-2xl font-bold text-green-700 dark:text-green-300"
              >
                {{ getInMonth().toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Expense Card -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-lg p-2 md:p-4 border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
          @click="clickDay('', '支出')"
        >
          <div class="flex items-center flex-row space-x-2">
            <div class="flex-shrink-0 mb-0">
              <div
                class="w-8 h-8 md:w-12 md:h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center"
              >
                <ArrowTrendingDownIcon
                  class="w-4 h-4 md:w-6 md:h-6 text-red-700 dark:text-red-300"
                />
              </div>
            </div>
            <div class="md:ml-4 text-center md:text-left">
              <p
                class="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                总支出
              </p>
              <p
                class="text-sm md:text-2xl font-bold text-red-700 dark:text-red-300"
              >
                {{ getOutMonth().toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Balance Card -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-lg p-2 md:p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center flex-row space-x-2">
            <div class="flex-shrink-0 mb-0">
              <div
                class="w-8 h-8 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
                :class="
                  balance >= 0
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-orange-100 dark:bg-orange-900'
                "
              >
                <ScaleIcon
                  class="w-4 h-4 md:w-6 md:h-6"
                  :class="
                    balance >= 0
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-orange-700 dark:text-orange-300'
                  "
                />
              </div>
            </div>
            <div class="md:ml-4 text-center md:text-left">
              <p
                class="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                结余
              </p>
              <p
                class="text-sm md:text-2xl font-bold"
                :class="
                  balance >= 0
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-orange-700 dark:text-orange-300'
                "
              >
                {{ balance.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar -->
      <div
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full"
        :class="
          isMobile
            ? 'rounded-lg shadow-md'
            : 'rounded-xl shadow-lg overflow-hidden'
        "
      >
        <!-- Desktop Calendar -->
        <div v-if="!isMobile" class="w-full">
          <DesktopCalendar
            :current-date="nowDate"
            :income-data="inDayCount"
            :expense-data="outDayCount"
            @add-flow="handleDesktopAddFlow"
            @click-day="clickDay"
            @month-change="handleDesktopMonthChange"
            @show-analysis="showMonthAnalysis"
          />
        </div>

        <!-- Mobile Calendar -->
        <div v-else class="p-0">
          <MobileCalendar
            :current-date="nowDate"
            :income-data="inDayCount"
            :expense-data="outDayCount"
            @add-flow="handleMobileAddFlow"
            @click-day="clickDay"
            @month-change="handleMobileMonthChange"
            @show-analysis="showMonthAnalysis"
          />
        </div>
      </div>
    </div>

    <!-- Month Analysis Dialog -->
    <div
      v-if="monthAnalysisDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50"
      @click="monthAnalysisDialog = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full"
        @click.stop
      >
        <div
          class="flex items-center justify-between p-2 md:p-6 border-b border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center gap-3">
            <ChartBarIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ monthTitle }} 流水分析
            </h3>
          </div>
          <button
            @click="monthAnalysisDialog = false"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <XMarkIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div class="p-2 md:p-4 max-h-[70vh] overflow-y-auto">
          <DatasMonthAnalysis :data="monthAnalysisData" />
        </div>
      </div>
    </div>

    <!-- Flow Table Dialog -->
    <div
      v-if="showFlowTable"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50"
      @click="showFlowTable = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[80vh] overflow-hidden"
        @click.stop
      >
        <div
          class="flex items-center justify-between p-2 md:p-3 border-b border-gray-200 dark:border-gray-700"
        >
          <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">
            {{ query.startDay }} - {{ query.endDay }} - {{ query.flowType }}
          </h2>
          <button
            @click="showFlowTable = false"
            class="md:px-3 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-xs md:font-sm"
          >
            关闭
          </button>
        </div>

        <div class="p-2 md:p-4 overflow-y-auto">
          <DatasFlowTable
            ref="flowTableRef"
            :query="query"
            v-if="showFlowTable"
            @edit-item="editItem"
            :actions="true"
          />
        </div>
      </div>
    </div>

    <!-- Add Flow Dialog -->
    <FlowEditDialog
      v-if="showFlowEditDialog"
      :title="dialogFormTitle"
      :flow="selectedFlow"
      :success-callback="addFlowSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  ChartBarIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

import FlowEditDialog from "~/components/dialog/FlowEditDialog.vue";
import MobileCalendar from "~/components/ui/MobileCalendar.vue";
import DesktopCalendar from "~/components/ui/DesktopCalendar.vue";
import { showFlowEditDialog } from "~/utils/flag";
import { daily } from "~/utils/apis";
import { dateFormater } from "~/utils/common";
import { doApi } from "~/utils/api";
import type { CommonChartQuery, MonthAnalysis, FlowQuery } from "~/utils/model";
import type { Flow } from "~/utils/table";

definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

// 编辑相关
const selectedFlow = ref<Flow | any>({});
const dialogFormTitle = ref("新增流水");
const formTitle = ["新增流水", "修改流水"];
const flowTableRef = ref();

const editItem = (item: any) => {
  dialogFormTitle.value = formTitle[1];
  selectedFlow.value = item;
  showFlowEditDialog.value = true;
};
// Theme detection
const isDark = ref(false);

// Responsive detection
const isMobile = ref(false);

// Current date and navigation
const nowDate = ref(new Date());

// Calendar data (removed as now handled by components)

// Data storage
const outMonthCount = ref<Record<string, number>>({});
const outDayCount = ref<Record<string, number>>({});
const inMonthCount = ref<Record<string, number>>({});
const inDayCount = ref<Record<string, number>>({});

// Dialog states
const monthAnalysisDialog = ref(false);
const showFlowTable = ref(false);
const monthTitle = ref("");
const monthAnalysisData = ref<MonthAnalysis>({
  month: "",
  outSum: "0",
  inSum: "0",
  zeroSum: "0",
  maxInType: "",
  maxInTypeSum: "0",
  maxOutType: "",
  maxOutTypeSum: "0",
  maxOut: {} as Flow,
  maxIn: {} as Flow,
  maxZero: {} as Flow,
});

const query = ref<FlowQuery>({
  pageNum: 1,
  pageSize: 20,
});

// Computed properties
const balance = computed(() => getInMonth() - getOutMonth());

// Methods
const doQuery = async (param: CommonChartQuery) => {
  return await daily(param);
};

const getInMonth = (): number => {
  const title = dayToMonth(nowDate.value);
  return Number(inMonthCount.value[title] || 0);
};

const getOutMonth = (): number => {
  const title = dayToMonth(nowDate.value);
  return Number(outMonthCount.value[title] || 0);
};

// Helper methods moved to components
const dayToMonth = (day: string | Date): string => {
  const date = new Date(day);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString();
  return `${year} 年 ${month} 月`;
};

// getExpenseClass method moved to components

// changeDate method moved to component handlers

const clickDay = (day: string, flowType?: string) => {
  if (day === "") {
    query.value.startDay = dateFormater(
      "YYYY-MM-dd",
      new Date(nowDate.value.getFullYear(), nowDate.value.getMonth(), 1)
    );
    query.value.endDay = dateFormater(
      "YYYY-MM-dd",
      new Date(nowDate.value.getFullYear(), nowDate.value.getMonth() + 1, 0)
    );
  } else {
    query.value.startDay = day;
    query.value.endDay = day;
  }

  query.value.flowType = flowType || "";
  showFlowTable.value = true;
};

// addFlow method moved to component handlers

const handleMobileAddFlow = (date: any) => {
  selectedFlow.value = { day: date.dateString };
  showFlowEditDialog.value = true;
};

const handleDesktopAddFlow = (date: any) => {
  selectedFlow.value = { day: date.dateString };
  showFlowEditDialog.value = true;
};

const handleMobileMonthChange = (date: Date) => {
  nowDate.value = date;
  // No need to call initQuery() - we already have all the data
};

const handleDesktopMonthChange = (date: Date) => {
  nowDate.value = date;
  // No need to call initQuery() - we already have all the data
};

const addFlowSuccess = (flow: Flow) => {
  if (flow.flowType === "不计收支") return;
  initQuery();

  // 刷新 FlowTable 数据
  if (flowTableRef.value && flowTableRef.value.refresh) {
    flowTableRef.value.refresh();
  }

  // const isOutFlow = flow.flowType === "支出";
  // const month = dayToMonth(flow.day || "");
  // const day = flow.day || "";

  // // Update month totals
  // if (isOutFlow) {
  //   outMonthCount.value[month] =
  //     (outMonthCount.value[month] || 0) + Number(flow.money);
  //   outDayCount.value[day] = (outDayCount.value[day] || 0) + Number(flow.money);
  // } else {
  //   inMonthCount.value[month] =
  //     (inMonthCount.value[month] || 0) + Number(flow.money);
  //   inDayCount.value[day] = (inDayCount.value[day] || 0) + Number(flow.money);
  // }
};

const showMonthAnalysis = (month: string) => {
  let monthParam = month
    .replace("年", "-")
    .replace("月", "")
    .replaceAll(" ", "");

  monthTitle.value = month;
  if (monthParam.split("-")[1] && monthParam.split("-")[1].length === 1) {
    monthParam = monthParam.split("-")[0] + "-0" + monthParam.split("-")[1];
  }

  doApi
    .post<MonthAnalysis>("api/entry/analytics/monthAnalysis", {
      month: monthParam,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      monthAnalysisData.value = res;
      monthAnalysisDialog.value = true;
    })
    .catch((err) => {
      console.log(err);
    });
};

const initQuery = () => {
  inMonthCount.value = {};
  inDayCount.value = {};
  outMonthCount.value = {};
  outDayCount.value = {};

  doQuery({}).then((res) => {
    if (res.length === 0) {
      return;
    }

    res.forEach((data) => {
      const month = dayToMonth(data.type);

      // Update day totals
      outDayCount.value[data.type] = data.outSum;
      inDayCount.value[data.type] = data.inSum;

      // Update month totals
      const outCount = outMonthCount.value[month] || 0;
      outMonthCount.value[month] = outCount + Number(data.outSum);

      const inCount = inMonthCount.value[month] || 0;
      inMonthCount.value[month] = inCount + Number(data.inSum);
    });
  });
};

// Theme detection
const checkTheme = () => {
  isDark.value = document.documentElement.classList.contains("dark");
};

// Responsive detection
const updateResponsive = () => {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth < 1024;
  }
};

onMounted(() => {
  checkTheme();
  updateResponsive();
  initQuery();

  // Watch for theme changes
  const themeObserver = new MutationObserver(checkTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // Watch for screen size changes
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateResponsive);
  }

  return () => {
    themeObserver.disconnect();
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", updateResponsive);
    }
  };
});
</script>

<style scoped>
/* 自定义日历样式 */
</style>
