import type { Flow } from "~/utils/table";
import { Alert } from "~/utils/alert";
import * as XLSX from "xlsx";
import {
  alipayConvert,
  jdFinanceConvert,
  wxpayConvert,
  templateConvert,
} from "@/utils/flowConvert";

export function useCsvFlowImport(options?: { onImportSuccess?: () => void }) {
  const csvFileInput = ref<HTMLInputElement | null>(null);
  const csvFlows = ref<Flow[] | any[]>([]);
  const csvHeaders = ref<Record<string, number>>({});
  const csvDatas = ref<Record<number, any>[]>([]);
  const fileType = ref("none");
  const titleRowIndex = ref(0);
  const showFlowExcelImportDialog = ref(false);

  const removeFile = () => {
    csvFlows.value = [];
    csvHeaders.value = {};
    csvDatas.value = [];
    if (csvFileInput.value) {
      csvFileInput.value.value = "";
    }
  };

  const openCsvImport = (type: string, closeDrawer?: () => void) => {
    if (csvFileInput.value) {
      csvFileInput.value.value = "";
    }
    fileType.value = type;
    if (type === "alipay") titleRowIndex.value = 24;
    else if (type === "wxpay") titleRowIndex.value = 16;
    else if (type === "jdFinance") titleRowIndex.value = 21;
    closeDrawer?.();
    nextTick(() => csvFileInput.value?.click());
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
            { header: 1, defval: "", dateNF: "yyyy-mm-dd" },
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
            if (
              !Number.isFinite(v) ||
              !Number.isInteger(v) ||
              !Number.isSafeInteger(v)
            )
              return "";
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
              orderNoVal = normalizeOrderNo(cell?.w);
              if (orderNoVal === "") orderNoVal = normalizeOrderNo(cell?.v);
            }
            if (orderNoVal === "") orderNoVal = normalizeOrderNo(row[orderNoCol]);
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
            flow = alipayConvert(row, csvHeaders.value, fileType.value);
          else if (fileType.value === "wxpay")
            flow = wxpayConvert(row, csvHeaders.value, fileType.value);
          else if (fileType.value === "jdFinance")
            flow = jdFinanceConvert(row, csvHeaders.value, fileType.value);
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
    options?.onImportSuccess?.();
  };

  const closeCsvTableDialog = () => {
    showFlowExcelImportDialog.value = false;
    removeFile();
  };

  return {
    csvFileInput,
    csvFlows,
    csvHeaders,
    csvDatas,
    fileType,
    titleRowIndex,
    showFlowExcelImportDialog,
    openCsvImport,
    readCsvInfo,
    removeFile,
    importSuccess,
    closeCsvTableDialog,
  };
}
