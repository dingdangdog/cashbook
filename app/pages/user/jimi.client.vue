<script setup lang="ts">
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

import JimiChat from "~/components/jimi/JimiChat.vue";
import CsvFlowTable from "@/components/datas/CsvFlowTable.vue";
import {
  DocumentTextIcon,
  ChevronDownIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  ChartBarIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { doApi } from "~/utils/api";

const isMobile = ref(false);
const toolsOpen = ref(false);
const updateResponsive = () => {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth < 1024;
  }
};

const {
  csvFileInput,
  csvFlows,
  csvHeaders,
  csvDatas,
  fileType,
  showFlowExcelImportDialog,
  openCsvImport,
  readCsvInfo,
  importSuccess,
  closeCsvTableDialog,
} = useCsvFlowImport({ onImportSuccess: () => fetchStats() });

const goImport = (type: "alipay" | "wxpay" | "jdFinance") => {
  toolsOpen.value = false;
  openCsvImport(type);
};

/** 账本统计 */
type StatsRange = "week" | "month" | "year" | "all";
const statsTab = ref<StatsRange>("month");
const stats = ref<{
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
}>({ totalIncome: 0, totalExpense: 0, netIncome: 0 });
const statsLoading = ref(false);

function getRangeDates(range: StatsRange): { startDate?: string; endDate?: string } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  end.setHours(23, 59, 59, 999);
  const format = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (range === "all") return {};
  if (range === "week") {
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { startDate: format(start), endDate: format(end) };
  }
  if (range === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: format(start), endDate: format(end) };
  }
  if (range === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { startDate: format(start), endDate: format(end) };
  }
  return {};
}

async function fetchStats() {
  statsLoading.value = true;
  try {
    const body = getRangeDates(statsTab.value);
    const res = await doApi.post<{
      totalIncome: number;
      totalExpense: number;
      netIncome: number;
    }>("api/entry/analytics/statistics", body);
    if (res) stats.value = res;
  } catch {
    stats.value = { totalIncome: 0, totalExpense: 0, netIncome: 0 };
  } finally {
    statsLoading.value = false;
  }
}

watch(statsTab, () => fetchStats());

const closeTools = () => { toolsOpen.value = false; };
onMounted(() => {
  updateResponsive();
  window.addEventListener("resize", updateResponsive);
  fetchStats();
  document.addEventListener("click", closeTools);
});
onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateResponsive);
    document.removeEventListener("click", closeTools);
  }
});

const router = useRouter();
const goBack = () => {
  router.back();
};
</script>

<template>
  <!-- 固定高度容器，避免在 public 布局下无限展开 -->
  <div class="flex flex-col bg-background text-foreground overflow-hidden"
    :class="isMobile ? 'h-[calc(100vh-4rem-3rem)]' : 'h-[calc(100vh-4rem)]'">
    <!-- 桌面端：保留顶部栏 + 附属功能 -->
    <header v-if="!isMobile" class="flex flex-shrink-0 flex-col border-b border-border bg-surface">
      <div class="flex items-center gap-2 px-4 py-3">
        <button type="button" class="rounded p-1 text-foreground/80 hover:bg-surface-muted" aria-label="返回"
          @click="goBack">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold">Jimi 助手</h1>
      </div>
    </header>
    <!-- 移动端：附属功能入口 -->
    <div v-if="isMobile"
      class="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface-muted px-3 py-2 text-sm">
      <span class="text-foreground/60">账单导入：</span>
      <button type="button" class="text-primary-600 hover:underline" @click="goImport('alipay')">
        支付宝
      </button>
      <span class="text-foreground/40">|</span>
      <button type="button" class="text-primary-600 hover:underline" @click="goImport('wxpay')">
        微信
      </button>
      <span class="text-foreground/40">|</span>
      <button type="button" class="text-primary-600 hover:underline" @click="goImport('jdFinance')">
        京东金融
      </button>
    </div>
    <!-- 账本统计：Tab 本周 / 本月 / 本年 / 全部 -->
    <div class="flex-shrink-0 border-b border-border bg-surface-muted/50 p-2 md:px-4">
      <div class="flex items-center gap-2 mb-2">
        <ChartBarIcon class="h-4 w-4 text-primary-600" />
        <span class="text-sm font-medium text-foreground/80">账本统计</span>

        <div class="flex gap-1">
          <button v-for="r in [
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' },
            { key: 'year', label: '本年' },
            { key: 'all', label: '全部' },
          ]" :key="r.key" type="button" class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors" :class="statsTab === r.key
            ? 'bg-primary-500 text-white'
            : 'text-foreground/70 hover:bg-surface hover:text-foreground'
            " @click="statsTab = r.key as StatsRange">
            {{ r.label }}
          </button>
        </div>
        <div class="ml-auto relative hidden md:block">
          <button type="button"
            class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-foreground/80 hover:bg-surface-muted border border-border"
            @click.stop="toolsOpen = !toolsOpen">
            <WrenchScrewdriverIcon class="h-5 w-5" />
            账单导入
            <ChevronDownIcon class="h-4 w-4 transition-transform" :class="{ 'rotate-180': toolsOpen }" />
          </button>
          <div v-show="toolsOpen"
            class="absolute right-0 top-full mt-1 py-1 min-w-32 rounded-lg border border-border bg-surface shadow-lg z-10"
            @click.stop>
            <button type="button"
              class="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-muted"
              @click="goImport('alipay')">
              <DocumentTextIcon class="h-4 w-4 text-primary-600" />
              支付宝
            </button>
            <button type="button"
              class="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-muted"
              @click="goImport('wxpay')">
              <DocumentTextIcon class="h-4 w-4 text-primary-600" />
              微信
            </button>
            <button type="button"
              class="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-muted"
              @click="goImport('jdFinance')">
              <DocumentTextIcon class="h-4 w-4 text-primary-600" />
              京东金融
            </button>
          </div>
        </div>
      </div>
      <div v-if="statsLoading" class="text-xs text-foreground/50 h-20 py-1">
        加载中...
      </div>
      <div v-else class="grid grid-cols-3 gap-2">
        <div class="rounded-lg bg-surface border border-border p-2 flex flex-col items-center">
          <ArrowTrendingUpIcon class="h-4 w-4 text-primary-600 mb-0.5" />
          <span class="text-xs text-foreground/60">总收入</span>
          <span class="text-sm font-semibold text-primary-700 dark:text-primary-300">
            {{ stats.totalIncome.toFixed(2) }}
          </span>
        </div>
        <div class="rounded-lg bg-surface border border-border p-2 flex flex-col items-center">
          <ArrowTrendingDownIcon class="h-4 w-4 text-red-600 mb-0.5" />
          <span class="text-xs text-foreground/60">总支出</span>
          <span class="text-sm font-semibold text-red-700 dark:text-red-300">
            {{ stats.totalExpense.toFixed(2) }}
          </span>
        </div>
        <div class="rounded-lg bg-surface border border-border p-2 flex flex-col items-center">
          <ScaleIcon class="h-4 w-4 mb-0.5" :class="stats.netIncome >= 0
            ? 'text-primary-600'
            : 'text-orange-600'
            " />
          <span class="text-xs text-foreground/60">净收入</span>
          <span class="text-sm font-semibold" :class="stats.netIncome >= 0
            ? 'text-primary-700 dark:text-primary-300'
            : 'text-orange-700 dark:text-orange-300'
            ">
            {{ stats.netIncome.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex-1 min-h-0 overflow-hidden">
      <JimiChat :show-session-list="true" :is-mobile="isMobile" :mobile-back-to-app="goBack" />
    </div>

    <!-- CSV 流水导入对话框（与账本日历一致） -->
    <div v-if="showFlowExcelImportDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      @click="closeCsvTableDialog">
      <div
        class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-border"
        @click.stop>
        <div class="px-4 py-3 border-b border-border flex justify-between items-center">
          <h3 class="text-base md:text-lg font-semibold">CSV流水导入</h3>
          <button @click="closeCsvTableDialog"
            class="text-foreground/50 hover:text-foreground/80 hover:bg-surface-muted p-1 rounded transition-colors">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 overflow-hidden p-4">
          <CsvFlowTable :items="csvFlows" :table-head="csvHeaders" :table-body="csvDatas"
            :success-callback="importSuccess" :import-source="fileType" />
        </div>
      </div>
    </div>

    <input ref="csvFileInput" type="file" accept=".csv,.xlsx" style="display: none" @change="readCsvInfo" />
  </div>
</template>
