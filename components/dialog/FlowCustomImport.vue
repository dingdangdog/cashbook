<template>
  <v-card title="自定义流水导入">
    <v-card-text>
      <v-tabs v-model="tab" align-tabs="center">
        <v-tab :value="1">1.文件信息</v-tab>
        <v-tab :value="2">2.映射配置</v-tab>
        <v-tab :value="3">3.数据预览</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item :value="1">
          <v-select
            v-model="fileType"
            :items="fileTypes"
            label="文件格式"
            hide-details="auto"
          ></v-select>
          <v-select
            v-model="fileEncoding"
            :items="fileEncodings"
            label="文件编码"
            hide-details="auto"
          ></v-select>
          <v-text-field
            v-model="titleRowLine"
            label="标题行行数"
            type="number"
            hide-details="auto"
          ></v-text-field>

          <div class="tw-text-center tw-my-4">
            <v-btn color="primary" @click="toSecondTab()"> 下一步 </v-btn>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item :value="2">
          <div class="tw-text-center tw-my-4">
            <v-btn
              color="success"
              class="tw-flex-1"
              @click="importCsvTemplate()"
            >
              选择文件
            </v-btn>
          </div>
          <div
            class="tw-max-h-[50vh] tw-overflow-y-auto tw-bg-gray-800/20 tw-p-2 tw-border tw-rounded-md"
          >
            <div
              v-if="csvHeaders.length === 0"
              class="tw-text-center tw-my-4 tw-text-red-500"
            >
              请先选择文件
            </div>
            <div
              v-else
              v-for="field in csvHeaders"
              :key="field"
              class="tw-my-2"
            >
              <h3 class="tw-my-1 tw-font-bold">{{ field }}</h3>
              <v-autocomplete
                class="mx-4"
                v-model="targetFieldMapping[field]"
                :items="targetFields"
                label="选择系统目标字段"
                hide-details="auto"
              ></v-autocomplete>
            </div>
          </div>
          <div
            class="tw-text-center tw-my-4 tw-flex tw-justify-center tw-space-x-4"
          >
            <v-btn color="secondary" @click="toFirstTab()"> 上一步 </v-btn>
            <v-btn color="primary" @click="toLastTab()"> 下一步 </v-btn>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item :value="3">
          <div class="tw-text-center tw-my-4">
            <v-btn
              color="success"
              @click="readCsvInfo"
              :disabled="
                !csvFile || Object.keys(targetFieldMapping).length === 0
              "
              >解析数据
            </v-btn>
          </div>
          <div
            v-if="csvHeaders.length === 0"
            class="tw-text-center tw-my-4 tw-text-red-500"
          >
            请先选择文件
          </div>
          <div class="tw-max-h-[50vh] tw-overflow-auto table-container">
            <div
              v-show="showCsvTable"
              class="excel-table tw-flex tw-justify-center"
            >
              <table ref="excelTable" class="tw-flex tw-flex-col">
                <thead ref="excelTableHead"></thead>
                <tbody
                  ref="excelTableBody"
                  class="tw-flex-1 tw-overflow-y-auto"
                ></tbody>
              </table>
            </div>
          </div>
          <div class="tw-text-center tw-my-4">
            <v-btn color="secondary" @click="toSecondTab()"> 上一步 </v-btn>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>

      <v-file-input
        ref="csvFileInput"
        label="选择账单CSV文件"
        variant="outlined"
        :accept="`.${fileType}`"
        small-chips
        hide-details="auto"
        show-size
        v-model="csvFile"
        @update:model-value="readCsvHeader()"
        v-show="false"
      ></v-file-input>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" variant="elevated" @click="closeDialog">关闭</v-btn>
      <v-btn
        variant="elevated"
        :loading="uploading"
        color="primary"
        @click="submitUpload"
        :disabled="csvFlows.length === 0"
        >导入数据</v-btn
      >
    </v-card-actions>

    <v-dialog v-model="showFlowExcelImportDialog" :fullscreen="true">
      <v-card>
        <v-card-title
          style="width: 100%; display: flex; justify-content: space-between"
        >
          <h3>CSV流水导入</h3>
          <v-btn
            variant="elevated"
            icon="mdi-close"
            color="error"
            @click="closeCsvTableDialog()"
          >
          </v-btn>
        </v-card-title>
        <v-card-text>
          <DatasCsvFlowTable
            :items="csvFlows"
            :table-head="csvHeaders"
            :table-body="csvDatas"
            :success-callback="importSuccess"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import * as XLSX from "xlsx";
import { showFlowExcelImportDialog } from "~/utils/flag";

// Define Flow interface
interface Flow {
  day?: string;
  flowType?: string;
  industryType?: string;
  payType?: string;
  money?: number;
  attribution?: string;
  name?: string;
  description?: string;
}

const emits = defineEmits(["success-callback", "close"]);

const fileType = ref("csv");
const fileTypes = ["csv", "xlsx", "xls"];
const fileEncoding = ref("UTF8");
const fileEncodings = ["UTF8", "GB2312"];
const titleRowLine = ref(1);
const tab = ref(1);
const csvFileInput = ref();
const csvFile = ref();

const csvFlows = ref<Flow[]>([]);
const csvHeaders = ref<string[]>([]);
const csvDatas = ref<any[]>([]);

const targetFields = ref<any[]>([
  { title: "日期", value: "day" },
  { title: "流水类型", value: "flowType" },
  { title: "支出/收入类型", value: "industryType" },
  { title: "支付/收款方式", value: "payType" },
  { title: "金额", value: "money" },
  { title: "流水归属", value: "attribution" },
  { title: "名称", value: "name" },
  { title: "备注", value: "description" },
]);

const targetFieldMapping = ref<Record<string, string>>({});
const headerIndexMap = ref<Record<string, number>>({});

const importCsvTemplate = () => {
  if (!csvFileInput.value) {
    return;
  }
  csvFileInput.value.click();
};

const readCsvHeader = () => {
  const file = csvFile.value;
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    const titleRowIndex = titleRowLine.value - 1;
    // 文件数据ArrayBuffer
    const buffer = event.target?.result;
    if (!buffer) {
      Alert.error("文件读取失败");
      return;
    }

    // 待保存excel实体
    let workbook: XLSX.WorkBook;

    try {
      /**************************************/
      // 不同编码格式读取
      /**************************************/
      if (fileEncoding.value === "GB2312") {
        // 阿里csv账单为GB2312编码，需要特殊处理
        // @ts-ignore
        const context = new TextDecoder("gb2312").decode(buffer);
        workbook = XLSX.read(context, { type: "string", codepage: 936 });
      } else {
        workbook = XLSX.read(buffer, { raw: true });
      }

      // 清理历史数据，准备解析组装新数据
      removeFile();

      /**************************************/
      // 将 xlsx 数据结构转换为 node-xlsx 数据结构
      /**************************************/
      const sheets = workbook.SheetNames.map((sheetName) => {
        const xlsxSheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json<any[]>(xlsxSheet, {
          header: 1, // 表头行数
          defval: "",
          dateNF: "yyyy-mm-dd", // 日期格式
        });
        return {
          sheetName,
          sheetData,
        };
      });

      // 数据集合--csv默认只有一个sheet，所以只需要取第一个sheet
      const sheetData: any[] = sheets[0].sheetData;
      if (!sheetData || sheetData.length <= titleRowIndex) {
        Alert.error("文件格式错误或标题行设置有误");
        return;
      }

      /**************************************/
      // 表头数据
      /**************************************/
      const headerData = sheetData[titleRowIndex];
      csvHeaders.value = [];
      headerIndexMap.value = {};

      for (let i = 0; i < headerData.length; i++) {
        if (!headerData[i] || headerData[i].trim() === "") {
          // 表头为空，跳过该列
          continue;
        }
        csvHeaders.value.push(headerData[i]);
        headerIndexMap.value[headerData[i]] = i;
      }

      // 自动切换到映射配置标签页
      tab.value = 2;
      Alert.success("文件解析成功，请配置字段映射");
    } catch (error) {
      console.error(error);
      Alert.error("文件解析失败，请检查文件格式和编码设置");
    }
  };
  reader.readAsArrayBuffer(file);
};

const readCsvInfo = () => {
  const file = csvFile.value;
  if (!file) {
    Alert.warning("请先选择文件");
    return;
  }

  // 检查映射配置是否完整
  const mappingKeys = Object.keys(targetFieldMapping.value);
  if (mappingKeys.length === 0) {
    Alert.warning("请先完成字段映射配置");
    tab.value = 2;
    return;
  }

  // 创建FileReader对象
  const reader = new FileReader();

  // 设置文件读取完成后的回调函数
  reader.onload = (event) => {
    try {
      const titleRowIndex = titleRowLine.value - 1;
      // 文件数据ArrayBuffer
      const buffer = event.target?.result;
      if (!buffer) {
        Alert.error("文件读取失败");
        return;
      }

      // 待保存excel实体
      let workbook: XLSX.WorkBook;

      /**************************************/
      // 不同编码格式读取
      /**************************************/
      if (fileEncoding.value === "GB2312") {
        // @ts-ignore
        const context = new TextDecoder("gb2312").decode(buffer);
        workbook = XLSX.read(context, { type: "string", codepage: 936 });
      } else {
        workbook = XLSX.read(buffer, { raw: true });
      }

      // 清理历史数据
      csvFlows.value = [];
      csvDatas.value = [];

      /**************************************/
      // 将 xlsx 数据结构转换为 node-xlsx 数据结构
      /**************************************/
      const sheets = workbook.SheetNames.map((sheetName) => {
        const xlsxSheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json<any[]>(xlsxSheet, {
          header: 1, // 表头行数
          defval: "",
          dateNF: "yyyy-mm-dd", // 日期格式
        });
        return {
          sheetName,
          sheetData,
        };
      });

      // 数据集合--csv默认只有一个sheet，所以只需要取第一个sheet
      const sheetData: any[] = sheets[0].sheetData;

      /**************************************/
      // 表头数据
      /**************************************/
      const headerData = sheetData[titleRowIndex];
      headerIndexMap.value = {};

      for (let i = 0; i < headerData.length; i++) {
        if (!headerData[i] || headerData[i].trim() === "") {
          // 表头为空，跳过该列
          continue;
        }
        headerIndexMap.value[headerData[i]] = i;
      }

      // 删除表头及以上行数据，只保留流水数据
      sheetData.splice(0, titleRowIndex + 1);

      /**************************************/
      // 数据主体处理
      /**************************************/
      // 查找日期字段对应的列索引
      const dateFieldName = Object.keys(targetFieldMapping.value).find(
        (key) => targetFieldMapping.value[key] === "day"
      );
      const dateIndex = dateFieldName
        ? headerIndexMap.value[dateFieldName]
        : -1;

      sheetData.forEach((row) => {
        // 处理日期格式
        if (dateIndex >= 0 && dateIndex < row.length) {
          let cellValue = row[dateIndex];
          if (typeof cellValue === "number" && cellValue > 0) {
            // Excel 中日期从1899年12月30日开始
            const excelStartDate = new Date(1899, 11, 30);
            const resultDate = new Date(excelStartDate);
            resultDate.setDate(resultDate.getDate() + cellValue);
            // 添加时区偏移（假设是+8小时）
            resultDate.setHours(resultDate.getHours() + 8);
            // 简单的日期转字符串
            cellValue = resultDate.toISOString().split("T")[0];
            // 将格式化后的字符串重新赋值
            row[dateIndex] = cellValue;
          } else if (cellValue && typeof cellValue === "string") {
            try {
              // 尝试解析日期字符串
              const resultDate = new Date(cellValue);
              if (!isNaN(resultDate.getTime())) {
                // 添加时区偏移（假设是+8小时）
                resultDate.setHours(resultDate.getHours() + 8);
                cellValue = resultDate.toISOString().split("T")[0];
                // 将格式化后的字符串重新赋值
                row[dateIndex] = cellValue;
              }
            } catch (e) {
              console.error("日期解析错误", e);
            }
          }
        }

        // 保存原始数据行
        csvDatas.value.push(row);

        // 解析数据到实体集合
        let flow = customConvert(
          row,
          headerIndexMap.value,
          targetFieldMapping.value
        );
        if (flow) {
          csvFlows.value.push(flow);
        }
      });

      // 切换到数据预览标签页
      tab.value = 3;

      // 渲染表格
      renderTable();

      Alert.success("数据解析完成，请预览并点击【导入数据】保存数据");
      showCsvTable.value = true;
    } catch (error) {
      console.error(error);
      Alert.error("数据解析出错了，请确认文件是否存在问题");
    }
  };
  showCsvTable.value = false;
  // 读取文件内容
  reader.readAsArrayBuffer(file);
};
const showCsvTable = ref(false);

/**
 * 根据映射配置转换数据
 * @param row 原始数据行
 * @param indexMap 列索引映射
 * @param fieldMapping 字段映射配置
 */
const customConvert = (
  row: any[],
  indexMap: Record<string, number>,
  fieldMapping: Record<string, string>
): Flow | null => {
  const flow: Flow = {};

  // 创建一个临时对象来存储相同目标字段的多个值
  const fieldValues: Record<string, string[]> = {};

  // 遍历映射配置，收集所有映射到相同目标字段的值
  for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
    if (
      indexMap[sourceField] !== undefined &&
      row[indexMap[sourceField]] !== undefined
    ) {
      const value = row[indexMap[sourceField]];

      // 初始化数组（如果不存在）
      if (!fieldValues[targetField]) {
        fieldValues[targetField] = [];
      }

      // 添加值到对应目标字段的数组
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        fieldValues[targetField].push(String(value).trim());
      }
    }
  }

  // 处理收集到的值
  let hasValidData = false;

  // 处理金额字段（特殊处理）
  if (fieldValues["money"] && fieldValues["money"].length > 0) {
    // 如果有多个金额字段，尝试解析第一个非零值
    for (const moneyStr of fieldValues["money"]) {
      const moneyValue =
        typeof moneyStr === "number" ? moneyStr : parseFloat(moneyStr);
      if (!isNaN(moneyValue) && moneyValue !== 0) {
        flow.money = moneyValue;
        hasValidData = true;
        break;
      }
    }
    // 如果所有值都是0，使用第一个值
    if (flow.money === undefined) {
      flow.money =
        typeof fieldValues["money"][0] === "number"
          ? fieldValues["money"][0]
          : parseFloat(fieldValues["money"][0]) || 0;
    }
  }

  // 处理其他字段（字符串拼接）
  for (const [targetField, values] of Object.entries(fieldValues)) {
    if (targetField === "money") continue; // 金额已处理

    if (values.length > 0) {
      // 将多个值用连字符连接
      const joinedValue = values.join("-");

      // 根据目标字段类型进行赋值
      if (targetField === "day") {
        flow.day = joinedValue;
      } else if (targetField === "flowType") {
        flow.flowType = joinedValue;
      } else if (targetField === "industryType") {
        flow.industryType = joinedValue;
      } else if (targetField === "payType") {
        flow.payType = joinedValue;
      } else if (targetField === "attribution") {
        flow.attribution = joinedValue;
      } else if (targetField === "name") {
        flow.name = joinedValue;
      } else if (targetField === "description") {
        flow.description = joinedValue;
      }

      hasValidData = true;
    }
  }

  // 如果没有有效数据，返回null
  return hasValidData ? flow : null;
};

const uploading = ref(false);
// 确定提交
const submitUpload = () => {
  // 待上传的流水数据
  const flows: Flow[] = [];
  flows.push(...csvFlows.value);

  if (flows.length === 0) {
    Alert.error("数据为空！");
    return;
  }

  // 存储配置
  const config = {
    fileType: fileType.value,
    fileEncoding: fileEncoding.value,
    titleRowLine: titleRowLine.value,
    targetFieldMapping: targetFieldMapping.value,
  };
  localStorage.setItem("importConfig", JSON.stringify(config));

  uploading.value = true;
  doApi
    .post("api/entry/flow/imports", {
      flows: flows,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res: any) => {
      // console.log(res)
      if (res && res.count > 0) {
        Alert.success("导入成功, 共导入" + res.count + "条流水");
        emits("success-callback");
        showFlowExcelImportDialog.value = false;
      } else {
        Alert.error("导入失败，请重试！");
      }
    })
    .catch(() => {
      Alert.error("导入失败，请重试！");
    })
    .finally(() => {
      uploading.value = false;
    });
};

const removeFile = () => {
  csvFlows.value = [];
  csvHeaders.value = [];
  csvDatas.value = [];
  headerIndexMap.value = {};
  return true;
};

const closeDialog = () => {
  removeFile();
  emits("close");
};

const closeCsvTableDialog = () => {
  showFlowExcelImportDialog.value = false;
};

const importSuccess = () => {
  closeCsvTableDialog();
  emits("success-callback");
};

const excelTable = ref();
const excelTableHead = ref();
const excelTableBody = ref();

// 渲染表格
const renderTable = () => {
  if (!excelTableHead.value || !excelTableBody.value) return;

  // 清空现有表格内容
  excelTableHead.value.innerHTML = "";
  excelTableBody.value.innerHTML = "";

  // 渲染表头
  const head = document.createElement("tr");
  for (let h of csvHeaders.value) {
    // 创建表头单元格元素
    const th = document.createElement("th");
    th.innerText = h;
    th.className = "excel-th";
    th.title = h; // 添加title属性，方便鼠标悬停查看完整内容
    head.appendChild(th);
  }
  excelTableHead.value.appendChild(head);

  // 计算表格宽度
  const tableWidth = csvHeaders.value.length * 8; // 每列8rem
  if (excelTable.value) {
    excelTable.value.style.width = `${tableWidth}rem`;
  }

  // 渲染表体
  for (let row of csvDatas.value) {
    // 创建行元素
    const tr = document.createElement("tr");

    // 部分数据字段格式化，并回显
    for (let i = 0; i < row.length; i++) {
      const cellValue = row[i];
      // 创建单元格元素
      const td = document.createElement("td");
      const displayValue = cellValue !== undefined ? String(cellValue) : "";
      td.innerText = displayValue;
      td.className = "excel-td";
      td.title = displayValue; // 添加title属性，方便鼠标悬停查看完整内容
      tr.appendChild(td);
    }
    excelTableBody.value.appendChild(tr);
  }

  // 确保表格可见
  showCsvTable.value = true;
};

// 恢复配置
onMounted(() => {
  const savedConfig = localStorage.getItem("importConfig");
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      fileType.value = config.fileType || fileType.value;
      fileEncoding.value = config.fileEncoding || fileEncoding.value;
      titleRowLine.value = config.titleRowLine || titleRowLine.value;
      targetFieldMapping.value = config.targetFieldMapping || {};
    } catch (e) {
      console.error("恢复配置失败", e);
    }
  }
});

const toFirstTab = () => {
  tab.value = 1;
};
const toSecondTab = () => {
  tab.value = 2;
};
const toLastTab = () => {
  tab.value = 3;
};
</script>

<style>
.table-container {
  width: 100%;
  overflow-x: auto;
  position: relative;
}

.excel-table {
  border-collapse: collapse;
  margin: 0 auto;
  max-height: 80vh;
  min-width: 100%;
  table-layout: fixed;
  display: inline-block;
  white-space: nowrap;
}

.excel-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: rgba(10, 10, 10, 0.3);
}

.excel-table tbody {
  display: block;
  overflow-y: auto;
  overflow-x: visible;
  max-height: 40vh;
}

.excel-table tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.excel-table tbody tr:nth-child(odd) {
  background-color: rgba(70, 70, 70, 0.3);
}

.excel-table tbody tr:nth-child(even) {
  background-color: rgba(30, 30, 30, 0.3);
}

.excel-th {
  min-width: 8rem;
  padding: 0.5rem;
  border-collapse: collapse;
  border: 1px solid;
  background-color: rgba(10, 10, 10, 0.3);
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.excel-td {
  min-width: 8rem;
  max-width: 8rem;
  padding: 0.2rem;
  border-collapse: collapse;
  border-bottom: 1px solid;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
