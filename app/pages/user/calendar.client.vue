<template>
  <div class="p-2 md:p-4 min-h-full space-y-3 md:space-y-4">
    <div class="max-w-7xl mx-auto space-y-3 md:space-y-4">
      <!-- 操作栏：导入、去重、平账、新增、筛选、重置 -->
      <FlowsToolbar
        :selected-count="0"
        :show-filter-reset="false"
        @open-import-export="importDrawer = true"
        @auto-merge="toAutoMergeFlows"
        @auto-deduplication="toAutoDeduplicationFlows"
        @create-new="openCreateDialog"
      />

      <!-- 统计卡片 -->
      <div class="grid grid-cols-3 gap-2 md:gap-4">
        <div
          class="bg-surface rounded-lg md:rounded-xl shadow border border-border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
          @click="clickDay('', '收入')"
        >
          <div class="flex items-center gap-2 md:gap-3 p-2 md:p-3">
            <div
              class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <ArrowTrendingUpIcon
                class="w-4 h-4 md:w-5 md:h-5 text-primary-700 dark:text-primary-300"
              />
            </div>
            <div
              class="flex flex-col md:flex-row items-center md:space-x-2 min-w-0 flex-1"
            >
              <p class="text-xs md:text-sm font-medium text-foreground/70">
                总收入
              </p>
              <p
                class="text-sm md:text-base font-bold text-primary-700 dark:text-primary-300 truncate"
              >
                {{ getInMonth().toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-surface rounded-lg md:rounded-xl shadow border border-border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
          @click="clickDay('', '支出')"
        >
          <div class="flex items-center gap-2 md:gap-3 p-2 md:p-3">
            <div
              class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <ArrowTrendingDownIcon
                class="w-4 h-4 md:w-5 md:h-5 text-red-700 dark:text-red-300"
              />
            </div>
            <div
              class="flex flex-col md:flex-row items-center md:space-x-2 min-w-0 flex-1"
            >
              <p class="text-xs md:text-sm font-medium text-foreground/70">
                总支出
              </p>
              <p
                class="text-sm md:text-base font-bold text-red-700 dark:text-red-300 truncate"
              >
                {{ getOutMonth().toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-surface rounded-lg md:rounded-xl shadow border border-border"
        >
          <div class="flex items-center gap-2 md:gap-3 p-2 md:p-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="
                balance >= 0
                  ? 'bg-primary-100 dark:bg-primary-900'
                  : 'bg-orange-100 dark:bg-orange-900'
              "
            >
              <ScaleIcon
                class="w-4 h-4 md:w-5 md:h-5"
                :class="
                  balance >= 0
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-orange-700 dark:text-orange-300'
                "
              />
            </div>
            <div
              class="flex flex-col md:flex-row items-center md:space-x-2 min-w-0 flex-1"
            >
              <p class="text-xs md:text-sm font-medium text-foreground/70">
                净收入
              </p>
              <p
                class="text-sm md:text-base font-bold truncate"
                :class="
                  balance >= 0
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-orange-700 dark:text-orange-300'
                "
              >
                {{ balance.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 日历 -->
      <div
        class="bg-surface border border-border w-full overflow-hidden rounded-lg md:rounded-xl shadow"
      >
        <DesktopCalendar
          v-if="!isMobile"
          :current-date="nowDate"
          :income-data="inDayCount"
          :expense-data="outDayCount"
          @add-flow="handleDesktopAddFlow"
          @click-day="clickDay"
          @month-change="handleDesktopMonthChange"
          @show-analysis="showMonthAnalysis"
        />
        <MobileCalendar
          v-else
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

    <!-- 筛选抽屉 -->
    <FlowsSearchDrawer
      :show="searchDrawer"
      :query="flowQuery"
      :name-list="nameList"
      :attribution-list="attributionList"
      @close="searchDrawer = false"
      @apply="handleSearchApply"
    />

    <!-- 导入导出抽屉 -->
    <FlowsImportDrawer
      :show="importDrawer"
      @close="importDrawer = false"
      @import-alipay="openCsvImport('alipay')"
      @import-wechat="openCsvImport('wxpay')"
      @import-jd="openCsvImport('jdFinance')"
      @custom-import="showFlowCustomImport"
      @import-json="openJsonImport"
      @export-json="exportJson"
      @export-csv="exportCsv"
      @download-template="downloadCsvTemplate"
      @import-template="importCsvTemplate"
    />

    <!-- 月度分析弹窗 -->
    <div
      v-if="monthAnalysisDialog"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-2 md:p-4 z-50"
      @click="monthAnalysisDialog = false"
    >
      <div
        class="bg-surface rounded-xl shadow-2xl max-w-2xl w-full border border-border"
        @click.stop
      >
        <div
          class="flex items-center justify-between p-2 md:p-4 border-b border-border"
        >
          <div class="flex items-center gap-3">
            <ChartBarIcon
              class="w-6 h-6 text-primary-600 dark:text-primary-400"
            />
            <h3 class="text-lg font-semibold text-foreground">
              {{ monthTitle }} 流水分析
            </h3>
          </div>
          <button
            @click="monthAnalysisDialog = false"
            class="p-2 rounded-lg hover:bg-surface-muted transition-colors"
          >
            <XMarkIcon class="w-5 h-5 text-foreground" />
          </button>
        </div>
        <div class="p-2 md:p-4 max-h-[70vh] overflow-y-auto">
          <DatasMonthAnalysis :data="monthAnalysisData" />
        </div>
      </div>
    </div>

    <!-- 流水列表弹窗 -->
    <div
      v-if="showFlowTable"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-2 md:p-4 z-50"
      @click="showFlowTable = false"
    >
      <div
        class="bg-surface rounded-xl shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col border border-border"
        @click.stop
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0"
        >
          <h2 class="text-base font-bold text-foreground">
            {{ flowQuery.startDay }} ~ {{ flowQuery.endDay }}
            <span v-if="flowQuery.flowType" class="text-foreground/70">
              · {{ flowQuery.flowType }}</span
            >
          </h2>
          <button
            @click="showFlowTable = false"
            class="px-3 py-1.5 bg-surface-muted hover:bg-surface text-foreground rounded-lg text-sm transition-colors"
          >
            关闭
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <DatasFlowTable
            ref="flowTableRef"
            :query="flowQuery"
            v-if="showFlowTable"
            @edit-item="editItem"
            :actions="true"
          />
        </div>
      </div>
    </div>

    <!-- CSV 流水导入对话框 -->
    <div
      v-if="showFlowExcelImportDialog"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="closeCsvTableDialog"
    >
      <div
        class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-border"
        @click.stop
      >
        <div
          class="px-4 py-3 border-b border-border flex justify-between items-center"
        >
          <h3 class="text-base md:text-lg font-semibold">CSV流水导入</h3>
          <button
            @click="closeCsvTableDialog"
            class="text-foreground/50 hover:text-foreground/80 hover:bg-surface-muted p-1 rounded transition-colors"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 overflow-hidden p-4">
          <CsvFlowTable
            :items="csvFlows"
            :table-head="csvHeaders"
            :table-body="csvDatas"
            :success-callback="importSuccess"
            :import-source="fileType"
          />
        </div>
      </div>
    </div>

    <!-- 自定义导入对话框 -->
    <div
      v-if="showFlowCustomImportDialog"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="closeCustomImport"
    >
      <div
        class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-md flex flex-col border border-border"
        @click.stop
      >
        <FlowCustomImportDialog
          @success-callback="onImportSuccess"
          @close="closeCustomImport"
        />
      </div>
    </div>

    <!-- JSON 导入对话框 -->
    <FlowJsonImportDialog
      v-if="showFlowJsonImportDialog"
      :success-callback="onImportSuccess"
    />

    <!-- 自助平账 -->
    <FlowAutoMergeDialog />

    <!-- 自助去重 -->
    <FlowAutoDeduplicationDialog />

    <!-- 编辑 / 新增流水 -->
    <FlowEditDialog
      v-if="showFlowEditDialog"
      :title="dialogFormTitle"
      :flow="selectedFlow"
      :success-callback="addFlowSuccess"
    />

    <FlowEditInvoiceDialog
      v-if="showFlowEditInvoiceDialog"
      :item="selectedFlow"
      :success-callback="onImportSuccess"
    />

    <input
      ref="csvFileInput"
      type="file"
      accept=".csv,.xlsx"
      style="display: none"
      @change="readCsvInfo"
    />
  </div>
</template>

<script setup lang="ts">
import {
  exportJson as exportJsonFile,
  exportCsv as exportCsvFile,
} from "~/utils/fileUtils";
import { Alert } from "~/utils/alert";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  ChartBarIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import FlowsToolbar from "@/components/flows/FlowsToolbar.vue";
import FlowsSearchDrawer from "@/components/flows/FlowsSearchDrawer.vue";
import FlowsImportDrawer from "@/components/flows/FlowsImportDrawer.vue";
import FlowEditDialog from "~/components/dialog/FlowEditDialog.vue";
import FlowEditInvoiceDialog from "~/components/dialog/FlowEditInvoiceDialog.vue";
import FlowAutoMergeDialog from "~/components/dialog/FlowAutoMergeDialog.vue";
import FlowAutoDeduplicationDialog from "~/components/dialog/FlowAutoDeduplicationDialog.vue";
import {
  showFlowEditDialog,
  showFlowEditInvoiceDialog,
  showFlowExcelImportDialog,
  showFlowJsonImportDialog,
  showAutoMergeFlowsDialog,
  showAutoDeduplicationFlowsDialog,
} from "~/utils/flag";
import CsvFlowTable from "@/components/datas/CsvFlowTable.vue";
import FlowCustomImportDialog from "@/components/dialog/FlowCustomImport.vue";
import FlowJsonImportDialog from "@/components/dialog/FlowJsonImportDialog.vue";
import MobileCalendar from "~/components/ui/MobileCalendar.vue";
import DesktopCalendar from "~/components/ui/DesktopCalendar.vue";
import DatasMonthAnalysis from "@/components/datas/MonthAnalysis.vue";
import DatasFlowTable from "@/components/datas/FlowTable.vue";
import { daily } from "~/utils/apis";
import { dateFormater } from "~/utils/common";
import { doApi } from "~/utils/api";
import type { CommonChartQuery, MonthAnalysis } from "~/utils/model";
import type { Flow } from "~/utils/table";
import * as XLSX from "xlsx";
import {
  alipayConvert,
  jdFinanceConvert,
  wxpayConvert,
  templateConvert,
} from "@/utils/flowConvert";

definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

const isMobile = ref(false);
const nowDate = ref(new Date());
const outMonthCount = ref<Record<string, number>>({});
const outDayCount = ref<Record<string, number>>({});
const inMonthCount = ref<Record<string, number>>({});
const inDayCount = ref<Record<string, number>>({});

const searchDrawer = ref(false);
const importDrawer = ref(false);
const showFlowCustomImportDialog = ref(false);
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

const flowQuery = ref<any>({
  pageNum: 1,
  pageSize: 20,
  startDay: "",
  endDay: "",
  attribution: "",
  name: "",
  description: "",
  flowType: "",
  industryType: "",
  payType: "",
  minMoney: undefined,
  maxMoney: undefined,
});

const selectedFlow = ref<Flow | any>({});
const dialogFormTitle = ref("新增流水");
const formTitle = ["新增流水", "修改流水"];
const flowTableRef = ref();

const csvFileInput = ref<HTMLInputElement | null>(null);
const csvFlows = ref<Flow[] | any[]>([]);
const csvHeaders = ref<Record<string, number>>({});
const csvDatas = ref<Record<number, any>[]>([]);
const fileType = ref("none");
const titleRowIndex = ref(0);

const nameList = ref<string[]>([]);
const attributionList = ref<string[]>([]);

const balance = computed(() => getInMonth() - getOutMonth());

const dayToMonth = (day: string | Date): string => {
  const date = new Date(day);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
};

const getInMonth = (): number => {
  const title = dayToMonth(nowDate.value);
  return Number(inMonthCount.value[title] || 0);
};

const getOutMonth = (): number => {
  const title = dayToMonth(nowDate.value);
  return Number(outMonthCount.value[title] || 0);
};

const loadDaily = async (param: CommonChartQuery) => daily(param);

const initQuery = () => {
  inMonthCount.value = {};
  inDayCount.value = {};
  outMonthCount.value = {};
  outDayCount.value = {};
  loadDaily({}).then((res) => {
    if (!res?.length) return;
    res.forEach((data: any) => {
      const month = dayToMonth(data.type);
      outDayCount.value[data.type] = data.outSum;
      inDayCount.value[data.type] = data.inSum;
      outMonthCount.value[month] =
        (outMonthCount.value[month] || 0) + Number(data.outSum);
      inMonthCount.value[month] =
        (inMonthCount.value[month] || 0) + Number(data.inSum);
    });
  });
};

const clickDay = (day: string, flowType?: string) => {
  if (day === "") {
    flowQuery.value.startDay = dateFormater(
      "YYYY-MM-dd",
      new Date(nowDate.value.getFullYear(), nowDate.value.getMonth(), 1),
    );
    flowQuery.value.endDay = dateFormater(
      "YYYY-MM-dd",
      new Date(nowDate.value.getFullYear(), nowDate.value.getMonth() + 1, 0),
    );
  } else {
    flowQuery.value.startDay = day;
    flowQuery.value.endDay = day;
  }
  flowQuery.value.flowType = flowType || "";
  flowQuery.value.pageNum = 1;
  showFlowTable.value = true;
};

const handleSearchApply = (query: any) => {
  Object.assign(flowQuery.value, query);
  flowQuery.value.pageNum = 1;
  searchDrawer.value = false;
  if (showFlowTable.value && flowTableRef.value?.refresh) {
    flowTableRef.value.refresh();
  }
};

const resetQuery = () => {
  flowQuery.value = {
    pageNum: 1,
    pageSize: 20,
    startDay: "",
    endDay: "",
    attribution: "",
    name: "",
    description: "",
    flowType: "",
    industryType: "",
    payType: "",
    minMoney: undefined,
    maxMoney: undefined,
  };
  searchDrawer.value = false;
  initQuery();
  if (showFlowTable.value && flowTableRef.value?.refresh) {
    flowTableRef.value.refresh();
  }
};

const toAutoMergeFlows = () => {
  showAutoMergeFlowsDialog.value = true;
};

const toAutoDeduplicationFlows = () => {
  showAutoDeduplicationFlowsDialog.value = true;
};

const openCreateDialog = () => {
  dialogFormTitle.value = formTitle[0] || "";
  selectedFlow.value = { day: dateFormater("YYYY-MM-dd", nowDate.value) };
  showFlowEditDialog.value = true;
};

const editItem = (item: any) => {
  dialogFormTitle.value = formTitle[1] || "";
  selectedFlow.value = item;
  showFlowEditDialog.value = true;
};

const handleMobileAddFlow = (date: any) => {
  dialogFormTitle.value = formTitle[0] || "";
  selectedFlow.value = { day: date.dateString };
  showFlowEditDialog.value = true;
};

const handleDesktopAddFlow = (date: any) => {
  dialogFormTitle.value = formTitle[0] || "";
  selectedFlow.value = { day: date.dateString };
  showFlowEditDialog.value = true;
};

const handleMobileMonthChange = (date: Date) => {
  nowDate.value = date;
};

const handleDesktopMonthChange = (date: Date) => {
  nowDate.value = date;
};

const onImportSuccess = () => {
  initQuery();
  if (flowTableRef.value?.refresh) flowTableRef.value.refresh();
};

const addFlowSuccess = (flow: Flow) => {
  if (flow.flowType === "不计收支") return;
  initQuery();
  if (flowTableRef.value?.refresh) flowTableRef.value.refresh();
};

const showMonthAnalysis = (month: string) => {
  let monthParam = month
    .replace("年", "-")
    .replace("月", "")
    .replaceAll(" ", "");
  monthTitle.value = month;
  if (monthParam.split("-")[1]?.length === 1) {
    monthParam = monthParam.split("-")[0] + "-0" + monthParam.split("-")[1];
  }
  doApi
    .post<MonthAnalysis>("api/entry/analytics/monthAnalysis", {
      month: monthParam,
    })
    .then((res) => {
      monthAnalysisData.value = res;
      monthAnalysisDialog.value = true;
    })
    .catch(console.error);
};

const getNames = async () => {
  try {
    const res = await doApi.post<string[]>("api/entry/flow/getNames", {});
    nameList.value = res ?? [];
  } catch (e) {
    console.error("获取名称列表失败:", e);
  }
};

const getAttributions = async () => {
  try {
    const res = await doApi.post<string[]>(
      "api/entry/flow/getAttributions",
      {},
    );
    attributionList.value = res ?? [];
  } catch (e) {
    console.error("获取归属列表失败:", e);
  }
};

const removeFile = () => {
  csvFlows.value = [];
  csvHeaders.value = {};
  csvDatas.value = [];
  if (csvFileInput.value) {
    csvFileInput.value.value = "";
  }
};

const openCsvImport = (type: string) => {
  if (csvFileInput.value) {
    csvFileInput.value.value = "";
  }
  fileType.value = type;
  if (type === "alipay") titleRowIndex.value = 24;
  else if (type === "wxpay") titleRowIndex.value = 16;
  else if (type === "jdFinance") titleRowIndex.value = 21;
  importDrawer.value = false;
  csvFileInput.value?.click();
};

const readCsvInfo = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target?.files?.[0];
  if (!file) {
    csvFlows.value = [];
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const buffer = e.target?.result;
      let workbook: XLSX.WorkBook;
      if (fileType.value === "alipay") {
        const context = new TextDecoder("gb2312").decode(buffer as ArrayBuffer);
        workbook = XLSX.read(context, { type: "string", codepage: 936 });
      } else {
        workbook = XLSX.read(buffer as ArrayBuffer, { raw: true });
      }
      removeFile();
      const sheets = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json<any[]>(
          sheet as XLSX.WorkSheet,
          {
            header: 1,
            defval: "",
            dateNF: "yyyy-mm-dd",
          },
        );
        return { sheetName, sheetData };
      });
      const sheetData: any[] = sheets[0]?.sheetData || [];
      const firstSheetName = workbook.SheetNames[0];
      const rawSheet =
        firstSheetName != null
          ? (workbook.Sheets[firstSheetName] as XLSX.WorkSheet | undefined)
          : undefined;

      const colToLetter = (col: number): string => {
        let s = "";
        for (let c = col + 1; c > 0; c = Math.floor((c - 1) / 26)) {
          s = String.fromCharCode(65 + ((c - 1) % 26)) + s;
        }
        return s;
      };

      const normalizeOrderNo = (v: unknown): string => {
        if (v == null || v === "") return "";
        if (typeof v === "number") {
          // 超过安全整数时数值已失真，不再继续转字符串参与去重
          if (
            !Number.isFinite(v) ||
            !Number.isInteger(v) ||
            !Number.isSafeInteger(v)
          ) {
            return "";
          }
          return String(v).trim();
        }
        return String(v).trim();
      };

      const headerData = sheetData[titleRowIndex.value] ?? [];
      for (let i = 0; i < headerData.length; i++) {
        const h = headerData[i] != null ? String(headerData[i]).trim() : "";
        if (h) csvHeaders.value[h] = i;
      }
      sheetData.splice(0, titleRowIndex.value + 1);
      const timeIndex = csvHeaders.value["交易时间"];
      const orderNoKey =
        fileType.value === "wxpay"
          ? "交易单号"
          : fileType.value === "alipay" || fileType.value === "jdFinance"
            ? "交易订单号"
            : null;
      const orderNoCol =
        orderNoKey != null ? csvHeaders.value[orderNoKey] : undefined;

      sheetData.forEach((row, rowIndex) => {
        if (orderNoCol !== undefined) {
          let orderNoVal = "";
          if (rawSheet) {
            const excelRow = titleRowIndex.value + 2 + rowIndex;
            const cellRef = colToLetter(orderNoCol) + excelRow;
            const cell = rawSheet[cellRef] as
              | { t?: string; v?: unknown; w?: unknown }
              | undefined;
            // 优先读单元格格式化文本 w，可保留 CSV 原始订单号（包含超长数字）
            orderNoVal = normalizeOrderNo(cell?.w);
            if (orderNoVal === "") {
              orderNoVal = normalizeOrderNo(cell?.v);
            }
          }
          if (orderNoVal === "") {
            orderNoVal = normalizeOrderNo(row[orderNoCol]);
          }
          row[orderNoCol] = orderNoVal;
        }
        for (let i = 0; i < row.length; i++) {
          let cellValue = row[i];
          if (i === timeIndex && cellValue != null) {
            if (typeof cellValue === "number" && cellValue > 0) {
              const excelStart = new Date(1899, 11, 30);
              const d = new Date(excelStart);
              d.setDate(d.getDate() + cellValue);
              d.setHours(d.getHours() + 8);
              cellValue = d.toISOString().split("T")[0];
            } else {
              const d = new Date(cellValue);
              d.setHours(d.getHours() + 8);
              cellValue = d.toISOString().split("T")[0];
            }
            row[i] = cellValue;
          }
        }
        csvDatas.value.push(row);
        let flow;
        if (fileType.value === "alipay")
          flow = alipayConvert(row, csvHeaders.value);
        else if (fileType.value === "wxpay")
          flow = wxpayConvert(row, csvHeaders.value);
        else if (fileType.value === "jdFinance")
          flow = jdFinanceConvert(row, csvHeaders.value);
        else flow = templateConvert(row, csvHeaders.value);
        csvFlows.value.push(flow);
      });
      Alert.warning("数据解析完成，请预览并点击【确定导入】保存数据");
      showFlowExcelImportDialog.value = true;
    } catch (err) {
      console.error(err);
      Alert.error("数据解析出错，请确认文件是否正确");
    }
  };
  reader.readAsArrayBuffer(file);
};

const importSuccess = () => {
  showFlowExcelImportDialog.value = false;
  removeFile();
  onImportSuccess();
};

const closeCsvTableDialog = () => {
  showFlowExcelImportDialog.value = false;
  removeFile();
};

const closeCustomImport = () => {
  showFlowCustomImportDialog.value = false;
};

const showFlowCustomImport = () => {
  showFlowCustomImportDialog.value = true;
  importDrawer.value = false;
};

const openJsonImport = () => {
  showFlowJsonImportDialog.value = true;
  importDrawer.value = false;
};

const exportJson = () => {
  doApi
    .post("api/entry/flow/list", { ...flowQuery.value })
    .then((data) => {
      exportJsonFile("流水-" + Date.now() + ".json", JSON.stringify(data));
      Alert.success("导出成功");
    })
    .catch(() => Alert.error("数据获取出错，无法导出"));
};

const exportCsv = () => {
  doApi
    .post<any[]>("api/entry/flow/list", { ...flowQuery.value })
    .then((data) => {
      exportCsvFile("流水-" + Date.now() + ".csv", data);
      Alert.success("导出成功");
    })
    .catch(() => Alert.error("数据获取出错，无法导出"));
};

const downloadCsvTemplate = () => {
  const link = document.createElement("a");
  link.href = "/csvtemplate.csv";
  link.download = "Cashbook模板.csv";
  link.click();
};

const importCsvTemplate = () => {
  fileType.value = "template";
  titleRowIndex.value = 0;
  importDrawer.value = false;
  csvFileInput.value?.click();
};

const updateResponsive = () => {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth < 1024;
  }
};

onMounted(() => {
  getNames();
  getAttributions();
  initQuery();
  updateResponsive();
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateResponsive);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateResponsive);
  }
});
</script>

<style scoped>
/* 日历页样式 */
</style>
