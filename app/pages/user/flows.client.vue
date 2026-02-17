<template>
  <div class="p-2 md:p-4 min-h-full space-y-2">
    <!-- 统计信息 -->
    <FlowsStatistics :statistics="flowPageRef" />

    <!-- 操作栏 -->
    <FlowsToolbar
      :selected-count="selectedFlows.length"
      @open-import-export="importDrawer = true"
      @auto-merge="toAutoMergeFlows"
      @auto-deduplication="toAutoDeduplicationFlows"
      @create-new="openCreateDialog"
      @delete-selected="deleteItems"
      @batch-change-type="toChangeTypeBatch"
      @open-search="searchDrawer = true"
      @reset-query="resetQuery"
    />

    <!-- 流水表格 -->
    <FlowsTable
      :flows="flowPageRef.data || []"
      :selected-items="selectedFlows"
      :is-all-selected="isAllSelected"
      :current-page="flowQuery.pageNum || 1"
      :page-size="flowQuery.pageSize || 20"
      :total="flowPageRef.total || 0"
      :total-pages="totalPages"
      :page-numbers="pageNumbers"
      :loading="loading"
      @toggle-select-all="toggleSelectAll"
      @toggle-select-item="toggleSelectItem"
      @edit-item="editItem"
      @edit-invoice="editInvoice"
      @delete-item="deleteItem"
      @change-page="changePage"
      @change-page-size="changePageSize"
    />

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

    <!-- CSV流水导入对话框 -->
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
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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
          @success-callback="doQuery"
          @close="closeCustomImport"
        />
      </div>
    </div>

    <!-- JSON导入对话框 -->
    <FlowJsonImportDialog
      v-if="showFlowJsonImportDialog"
      :success-callback="doQuery"
    />

    <!-- 批量修改类型对话框 -->
    <div
      v-if="showBatchChangeDialog"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="closeBatchChangeDialog"
    >
      <div
        class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-md flex flex-col border border-border"
        @click.stop
      >
        <div
          class="px-4 py-3 border-b border-border flex justify-between items-center"
        >
          <h3 class="text-base md:text-lg font-semibold">批量修改类型</h3>
          <button
            @click="closeBatchChangeDialog"
            class="text-foreground/50 hover:text-foreground/80 hover:bg-surface-muted p-1 rounded transition-colors"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="p-4 space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-foreground/70">
              流水类型
            </label>
            <select
              v-model="batchChange.flowType"
              class="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">不修改</option>
              <option value="支出">支出</option>
              <option value="收入">收入</option>
              <option value="不计收支">不计收支</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-foreground/70">
              支出/收入类型
            </label>
            <input
              v-model="batchChange.industryType"
              type="text"
              placeholder="不修改"
              class="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-foreground/70">
              支付/收款方式
            </label>
            <input
              v-model="batchChange.payType"
              type="text"
              placeholder="不修改"
              class="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-foreground/70">
              流水归属
            </label>
            <input
              v-model="batchChange.attribution"
              type="text"
              placeholder="不修改"
              class="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div class="px-4 py-3 border-t border-border bg-surface-muted">
          <div class="flex gap-2">
            <button
              @click="closeBatchChangeDialog"
              class="flex-1 px-4 py-2 bg-surface hover:bg-surface-muted text-foreground/80 rounded text-sm font-medium transition-colors border border-border"
            >
              取消
            </button>
            <button
              @click="confirmBatchChange"
              class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors"
            >
              确认修改
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="csvFileInput"
      type="file"
      accept=".csv,.xlsx"
      style="display: none"
      @change="readCsvInfo"
    />

    <!-- 自助平账对话框 -->
    <FlowAutoMergeDialog />

    <!-- 自助去重对话框 -->
    <FlowAutoDeduplicationDialog />

    <!-- 编辑对话框 -->
    <FlowEditDialog
      v-if="showFlowEditDialog"
      :title="dialogFormTitle"
      :flow="selectedFlow"
      :success-callback="doQuery"
    />

    <FlowEditInvoiceDialog
      v-if="showFlowEditInvoiceDialog"
      :item="selectedFlow"
      :success-callback="doQuery"
    />
  </div>
</template>

<script setup lang="ts">
import {
  exportJson as exportJsonFile,
  exportCsv as exportCsvFile,
} from "~/utils/fileUtils";
import type { Page } from "~/utils/model";
import { Alert } from "~/utils/alert";
import { Confirm } from "~/utils/confirm";
import FlowsToolbar from "@/components/flows/FlowsToolbar.vue";
import FlowsStatistics from "@/components/flows/FlowsStatistics.vue";
import FlowsTable from "@/components/flows/FlowsTable.vue";
import FlowsSearchDrawer from "@/components/flows/FlowsSearchDrawer.vue";
import FlowsImportDrawer from "@/components/flows/FlowsImportDrawer.vue";
import FlowAutoMergeDialog from "~/components/dialog/FlowAutoMergeDialog.vue";
import FlowAutoDeduplicationDialog from "~/components/dialog/FlowAutoDeduplicationDialog.vue";
import FlowEditDialog from "~/components/dialog/FlowEditDialog.vue";
import FlowEditInvoiceDialog from "~/components/dialog/FlowEditInvoiceDialog.vue";
import {
  showAutoMergeFlowsDialog,
  showAutoDeduplicationFlowsDialog,
  showFlowEditDialog,
  showFlowEditInvoiceDialog,
  showFlowExcelImportDialog,
  showFlowJsonImportDialog,
} from "~/utils/flag";
import CsvFlowTable from "@/components/datas/CsvFlowTable.vue";
import FlowCustomImportDialog from "@/components/dialog/FlowCustomImport.vue";
import FlowJsonImportDialog from "@/components/dialog/FlowJsonImportDialog.vue";
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

// 数据定义
const flowPageRef = ref<any>({
  data: [],
  total: 0,
  totalIn: 0,
  totalOut: 0,
  notInOut: 0,
});
const selectedFlows = ref<any[]>([]);
const searchDrawer = ref(false);
const importDrawer = ref(false);
const showFlowCustomImportDialog = ref(false);
const showBatchChangeDialog = ref(false);
const loading = ref(false);

// 编辑相关
const selectedFlow = ref<Flow | any>({});
const dialogFormTitle = ref("新增流水");
const formTitle = ["新增流水", "修改流水"];

// CSV导入相关
const csvFileInput = ref();
const csvFile = ref();
const csvFlows = ref<Flow[] | any>([]);
const csvHeaders = ref<Record<string, number>>({});
const csvDatas = ref<Record<number, any>[]>([]);
const fileType = ref("none");
const titleRowIndex = ref(0);

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

const batchChange = ref<any>({
  flowType: "",
  industryType: "",
  payType: "",
  attribution: "",
});

// 获取数据列表
const nameList = ref<string[]>([]);
const getNames = async () => {
  try {
    const res = await doApi.post<string[]>("api/entry/flow/getNames", {});
    nameList.value = res;
  } catch (error) {
    console.error("获取名称列表失败:", error);
  }
};

const attributionList = ref<string[]>([]);
const getAttributions = async () => {
  try {
    const res = await doApi.post<string[]>(
      "api/entry/flow/getAttributions",
      {},
    );
    attributionList.value = res;
  } catch (error) {
    console.error("获取归属列表失败:", error);
  }
};

// 执行分页数据查询
const doQuery = () => {
  // 清空选中状态
  selectedFlows.value = [];
  loading.value = true;
  searchDrawer.value = false;
  doApi
    .post<Page<Flow>>("api/entry/flow/page", {
      ...flowQuery.value,
    })
    .then((res) => {
      if (res) {
        flowPageRef.value = res;
      }
    })
    .catch((error) => {
      console.error("查询流水失败:", error);
      Alert.error("查询流水失败");
    })
    .finally(() => {
      loading.value = false;
    });
};

// 计算属性
const isAllSelected = computed(() => {
  const flows = flowPageRef.value?.data || [];
  return flows.length > 0 && selectedFlows.value.length === flows.length;
});

const totalPages = computed(() =>
  Math.ceil((flowPageRef.value?.total || 0) / (flowQuery.value.pageSize || 20)),
);

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = flowQuery.value.pageNum || 1;
  const delta = 2;
  const range = [];

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  if (current - delta > 2) {
    range.unshift("...");
  }
  if (current + delta < total - 1) {
    range.push("...");
  }

  range.unshift(1);
  if (total > 1) {
    range.push(total);
  }

  return range;
});

// 方法定义
const toggleSelectAll = () => {
  const flows = flowPageRef.value?.data || [];
  if (isAllSelected.value) {
    selectedFlows.value = [];
  } else {
    selectedFlows.value = flows.map((item: any) => item.id);
  }
};

const toggleSelectItem = (id: string | number) => {
  const index = selectedFlows.value.indexOf(id);
  if (index > -1) {
    selectedFlows.value.splice(index, 1);
  } else {
    selectedFlows.value.push(id);
  }
};

const changePageSize = (size: string) => {
  flowQuery.value.pageSize = Number(size);
  flowQuery.value.pageNum = 1;
  doQuery();
};

const changePage = (page: number | string) => {
  if (typeof page === "number") {
    flowQuery.value.pageNum = page;
    doQuery();
  }
};

const handleSearchApply = (query: any) => {
  Object.assign(flowQuery.value, query);
  flowQuery.value.pageNum = 1;
  doQuery();
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
  selectedFlows.value = [];
  doQuery();
};

// 操作方法
const toAutoMergeFlows = () => {
  showAutoMergeFlowsDialog.value = true;
};

const toAutoDeduplicationFlows = () => {
  showAutoDeduplicationFlowsDialog.value = true;
};

const openCreateDialog = () => {
  dialogFormTitle.value = formTitle[0] || "";
  showFlowEditDialog.value = true;
  selectedFlow.value = {};
};

const deleteItems = () => {
  if (selectedFlows.value.length <= 0) {
    Alert.error("请至少选择一条要删除的流水");
    return;
  }
  Confirm.open({
    title: "删除确认",
    content: `确定删除流水 【${selectedFlows.value.length} 条】吗?`,
    confirm: () => {
      doApi
        .post("api/entry/flow/dels", {
          ids: selectedFlows.value,
        })
        .then(() => {
          Alert.success("删除成功");
          selectedFlows.value = [];
          doQuery();
        })
        .catch(() => {
          Alert.error("删除失败");
        });
    },
  });
};

const toChangeTypeBatch = () => {
  if (selectedFlows.value.length <= 0) {
    Alert.error("请至少选择一条要修改的流水");
    return;
  }
  showBatchChangeDialog.value = true;
};

// 编辑单个流水
const editItem = (item: any) => {
  dialogFormTitle.value = formTitle[1] || "";
  selectedFlow.value = item;
  showFlowEditDialog.value = true;
};

// 删除单个流水
const deleteItem = (item: any) => {
  if (!item.id) {
    Alert.error("请选择要删除的数据");
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
          doQuery();
        })
        .catch(() => {
          Alert.error("删除失败");
        });
    },
  });
};

// 批量修改对话框
const closeBatchChangeDialog = () => {
  showBatchChangeDialog.value = false;
  batchChange.value = {
    flowType: "",
    industryType: "",
    payType: "",
    attribution: "",
  };
};

const confirmBatchChange = () => {
  let changeInfo = "";
  if (batchChange.value.flowType) {
    changeInfo += `  流水类型改为: "${batchChange.value.flowType}"\n`;
  }
  if (batchChange.value.industryType) {
    changeInfo += `  支出类型/收入类型改为: "${batchChange.value.industryType}"\n`;
  }
  if (batchChange.value.payType) {
    changeInfo += `  支付方式/收款方式改为: "${batchChange.value.payType}"`;
  }
  if (batchChange.value.attribution) {
    changeInfo += `  流水归属改为: "${batchChange.value.attribution}"`;
  }
  if (!changeInfo) {
    Alert.error("未发现任何变更信息");
    return;
  }
  Confirm.open({
    title: "修改确认",
    content: `确定对【${selectedFlows.value.length}】条流水进行如下修改吗? \n${changeInfo}`,
    confirm: () => {
      doApi
        .post("api/entry/flow/updates", {
          ids: selectedFlows.value,

          ...batchChange.value,
        })
        .then(() => {
          Alert.success("修改成功");
          closeBatchChangeDialog();
          doQuery();
        })
        .catch(() => {
          Alert.error("修改失败");
        });
    },
  });
};

// CSV导入方法
const openCsvImport = (type: string) => {
  if (!csvFileInput.value) {
    return;
  }
  if ("value" in csvFileInput.value) {
    (csvFileInput.value as HTMLInputElement).value = "";
  }
  fileType.value = type;
  if (fileType.value === "alipay") {
    // 支付宝表头行是第25行，索引是24
    titleRowIndex.value = 24;
  } else if (fileType.value === "wxpay") {
    // 微信表头行是第17行，索引是16
    titleRowIndex.value = 16;
  } else if (fileType.value === "jdFinance") {
    // 京东金融表头行是第22行，索引是21
    titleRowIndex.value = 21;
  }
  importDrawer.value = false;
  csvFileInput.value.click();
};

const readCsvInfo = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target?.files?.[0];
  csvFile.value = file;

  if (!file) {
    csvFlows.value = [];
    return;
  }

  // 创建FileReader对象
  const reader = new FileReader();

  // 设置文件读取完成后的回调函数
  reader.onload = (event) => {
    try {
      // 文件数据ArrayBuffer
      const buffer = event.target?.result;
      // 待保存excel实体
      let workbook: XLSX.WorkBook;

      /**************************************/
      // 不同编码格式读取
      /**************************************/
      if (fileType.value === "alipay") {
        // 阿里csv账单为GB2312编码，需要特殊处理
        // @ts-ignore
        const context = new TextDecoder("gb2312").decode(buffer);
        workbook = XLSX.read(context, { type: "string", codepage: 936 });
      } else {
        workbook = XLSX.read(buffer, { raw: true });
      }
      // 至此，初步说明文件没有什么问题，清理一下历史数据，准备解析组装新数据
      removeFile();

      /**************************************/
      // 将 xlsx 数据结构转换为 node-xlsx 数据结构，便于页面回显
      // sheets是sheet的数组，每个sheet有两个属性: name - sheet名称 data - sheet数据
      /**************************************/
      const sheets = workbook.SheetNames.map((sheetName) => {
        const xlsxSheet = workbook.Sheets[sheetName] ?? {};
        const sheetData = XLSX.utils.sheet_to_json<any[]>(
          xlsxSheet as XLSX.WorkSheet,
          {
            header: 1, // 表头行数
            defval: "",
            dateNF: "yyyy-mm-dd", // 日期格式
          },
        );
        return {
          sheetName,
          sheetData,
        };
      });

      // 数据集合--csv默认只有一个sheet，所以只需要取第一个sheet
      const sheetData: any[] = sheets[0]?.sheetData ?? [];
      const firstSheetName = workbook.SheetNames[0];
      const rawSheet =
        firstSheetName != null
          ? (workbook.Sheets[firstSheetName] as XLSX.WorkSheet | undefined)
          : undefined;

      /** 0-based 列索引转 Excel 列字母，用于从原始 sheet 取单元格 */
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

      /**************************************/
      // 表头数据
      /**************************************/
      // 表头索引集合，key-表头值，value-表头索引（表头值先 trim，避免键不一致）
      const headerData = sheetData[titleRowIndex.value] ?? [];
      for (let i = 0; i < headerData.length; i++) {
        const h = headerData[i] != null ? String(headerData[i]).trim() : "";
        if (h === "") continue;
        csvHeaders.value[h] = i;
      }
      // 删除表头及以上行数据，只保留流水数据
      sheetData.splice(0, titleRowIndex.value + 1);

      /**************************************/
      // 数据主体（table-body）回显
      /**************************************/
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
        // 部分数据字段格式化，并回显
        for (let i = 0; i < row.length; i++) {
          let cellValue = row[i];
          // 日期字段特殊处理，将日期数字转换为 JavaScript 日期对象
          // 目前京东/支付宝/微信可以统一处理
          if (i === timeIndex) {
            if (typeof cellValue === "number" && cellValue > 0) {
              // Excel 中日期从1899年12月30日开始
              const excelStartDate = new Date(1899, 11, 30);
              const resultDate = new Date(excelStartDate);
              resultDate.setDate(resultDate.getDate() + cellValue);
              // 添加时区偏移（假设是+8小时）
              resultDate.setHours(resultDate.getHours() + 8);
              // 简单的日期转字符串
              cellValue = resultDate.toISOString().split("T")[0];
              // 将格式化后的字符串重新赋值会sheetData，后续存储需要使用格式化后的的数据
              row[i] = cellValue;
            } else {
              // 每年1月1日解析后不是数字，因此不需要特殊处理，直接当作日期处理即可
              // 已知只有支付宝1月1日会报错。其他的还不知道
              const resultDate = new Date(cellValue);
              // 添加时区偏移（假设是+8小时）
              resultDate.setHours(resultDate.getHours() + 8);
              cellValue = resultDate.toISOString().split("T")[0];
              // 将格式化后的字符串重新赋值会sheetData，后续存储需要使用格式化后的的数据
              row[i] = cellValue;
            }
          }
        }
        // 一行数据作为一个记录，csvDatas中每一个记录代表一个流水
        csvDatas.value.push(row);

        /**************************************/
        // 解析数据到实体集合
        /**************************************/
        let flow;
        if (fileType.value === "alipay") {
          flow = alipayConvert(row, csvHeaders.value);
        } else if (fileType.value === "wxpay") {
          flow = wxpayConvert(row, csvHeaders.value);
        } else if (fileType.value === "jdFinance") {
          flow = jdFinanceConvert(row, csvHeaders.value);
        } else {
          // 其他数据，暂不处理
          flow = templateConvert(row, csvHeaders.value);
        }
        csvFlows.value.push(flow);
      });
      Alert.warning("数据解析完成，请预览并点击【确定导入】保存数据");
      showFlowExcelImportDialog.value = true;
    } catch (error) {
      console.error(error);
      Alert.error("数据解析出错了，请确认文件是否存在问题");
    }
  };

  // 读取文件的内容为文本
  reader.readAsArrayBuffer(file);
};

const importSuccess = () => {
  closeCsvTableDialog();
  doQuery();
};

const removeFile = () => {
  csvFlows.value = [];
  csvHeaders.value = {};
  csvDatas.value = [];
  csvFile.value = undefined; // 清楚选中的文件
  if (csvFileInput.value && "value" in csvFileInput.value) {
    (csvFileInput.value as HTMLInputElement).value = "";
  }
  return true;
};

const closeCustomImport = () => {
  showFlowCustomImportDialog.value = false;
};

// CSV导入对话框
const closeCsvTableDialog = () => {
  showFlowExcelImportDialog.value = false;
  removeFile();
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
    .post("api/entry/flow/list", {
      ...flowQuery.value,
    })
    .then((data) => {
      const fileName = "流水-" + new Date().getTime() + ".json";
      exportJsonFile(fileName, JSON.stringify(data));
      Alert.success("导出成功");
    })
    .catch(() => {
      Alert.error("数据获取出错，无法导出！");
    });
};

const exportCsv = () => {
  doApi
    .post<any[]>("api/entry/flow/list", {
      ...flowQuery.value,
    })
    .then((data) => {
      const fileName = "流水-" + new Date().getTime() + ".csv";
      exportCsvFile(fileName, data);
      Alert.success("导出成功");
    })
    .catch(() => {
      Alert.error("数据获取出错，无法导出！");
    });
};

const downloadCsvTemplate = () => {
  const fileName = "Cashbook模板.csv";
  const url = "/csvtemplate.csv";
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
};

const importCsvTemplate = () => {
  if (!csvFileInput.value) {
    return;
  }
  fileType.value = "template";
  titleRowIndex.value = 0;
  importDrawer.value = false;
  csvFileInput.value.click();
};

// 编辑单个流水
const editInvoice = (item: any) => {
  selectedFlow.value = item;
  showFlowEditInvoiceDialog.value = true;
};

const closeInvoiceDialog = () => {
  selectedFlow.value = undefined;
};

// 初始化数据
onMounted(() => {
  getNames();
  getAttributions();
  doQuery();
});
</script>
