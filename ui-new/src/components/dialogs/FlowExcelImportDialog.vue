<template>
  <v-dialog v-model="showFlowExcelImportDialog" :fullscreen="true">
    <v-card>
      <v-card-title style="width: 100%; display: flex; justify-content: space-between">
        <h3>CSV流水导入</h3>
        <v-btn
          variant="elevated"
          icon="mdi-close"
          color="error"
          @click="showFlowExcelImportDialog = false"
        >
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div class="dialog-container">
          <v-file-input
            ref="csvFileInput"
            label="选择Json文件"
            variant="outlined"
            accept=".csv"
            small-chips
            hide-details="auto"
            show-size
            v-model="csvFile"
            @update:model-value="readJsonInfo"
            v-show="false"
          ></v-file-input>
          <div class="csv-dialog-header">
            <v-btn
              class="btn-group-btn"
              variant="elevated"
              color="primary"
              @click="clickButton('alipay')"
              >支付宝文件</v-btn
            >
            <v-btn
              class="btn-group-btn"
              variant="elevated"
              color="success"
              @click="clickButton('wxpay')"
              >微信文件</v-btn
            >
            <v-btn
              class="btn-group-btn"
              variant="elevated"
              color="error"
              @click="clickButton('jdFinance')"
              >京东金融</v-btn
            >
          </div>
          <div style="margin: 0.5rem auto; width: 35rem">
            <p class="upload-tip">
              1、目前仅支持移动端 <b>支付宝/微信/京东金融</b> 导出的 <b>CSV</b> 账单文件；
            </p>
            <p class="upload-tip">2、导入数据默认分为 <b>支出/收入/不计收支</b> 三种流水类型；</p>
            <p class="upload-tip">
              3、选择文件后可以预览数据，只有点击
              <v-btn variant="elevated" color="primary" @click="submitUpload" :disabled="uploading"
                >确定导入</v-btn
              >
              后才会上传数据。
            </p>
          </div>
          <hr />
          <div class="excel-table">
            <table ref="excelTable">
              <thead ref="excelTableHead"></thead>
              <tbody ref="excelTableBody"></tbody>
            </table>
          </div>
          <hr />
          <div class="csv-dialog-header" style="margin-top: 1rem">
            <h4>解析结果：</h4>
            <!-- <div style="width: 10rem">
              <v-text-field
                label="标题索引"
                variant="outlined"
                hide-details="auto"
                v-model="titleRowIndex"
                disabled
              ></v-text-field>
            </div>
            <v-tooltip text="标题行的索引，从0开始，如：微信默认第17行是标题行，则索引是16">
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-help" v-bind="props"></v-btn>
              </template>
            </v-tooltip> -->
            <div style="width: 10rem">
              <v-text-field
                label="流水数量"
                variant="outlined"
                hide-details="auto"
                v-model="flowCount"
                disabled
              ></v-text-field>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as XLSX from 'xlsx'
import type { Flow } from '@/model/flow'
import { alipayConvert, jdFinanceConvert, wxpayConvert } from '@/utils/flowConvert'
import { importFlows } from '@/api/api.flow'
import { showFlowExcelImportDialog } from '@/stores/flag'
import { getTypeRelation } from '@/api/api.typer'
import { typeRelation } from '@/utils/store'
import { errorAlert, successAlert, warningAlert } from '@/utils/alert'

const { successCallback } = defineProps(['successCallback'])

// 上传文件类型标识：none-未知文件；alipay-支付宝
const fileType = ref('none')
const uploading = ref(false)
// 表头行索引
const titleRowIndex = ref(0)
let titleRowIndexValue = 0
// 解析后的流水数量
const flowCount = ref(0)
const csvFileInput = ref()
const clickButton = (type: string) => {
  if (!csvFileInput.value) {
    return
  }
  fileType.value = type
  if (fileType.value === 'alipay') {
    // 支付宝表头行是第25行，索引是24
    titleRowIndexValue = 24
  } else if (fileType.value === 'wxpay') {
    // 微信表头行是第17行，索引是16
    titleRowIndexValue = 16
  } else if (fileType.value === 'jdFinance') {
    // 京东金融表头行是第22行，索引是21
    titleRowIndexValue = 21
  }
  csvFileInput.value.click()
}

const csvFile = ref()
const csvFlows = ref<Flow[]>([])

// 读取json文件并导入
const readJsonInfo = () => {
  // console.log(csvFile.value)
  const file = csvFile.value
  if (!file) {
    csvFlows.value = []
    return
  }
  // 创建FileReader对象
  const reader = new FileReader()

  // 设置文件读取完成后的回调函数
  reader.onload = (event) => {
    try {
      // 文件数据ArrayBuffer
      const buffer = event.target?.result
      // 待保存excel实体
      let workbook: XLSX.WorkBook

      /**************************************/
      // 不同编码格式读取
      /**************************************/
      if (fileType.value === 'alipay') {
        // 阿里csv账单为GB2312编码，需要特殊处理，gan
        // @ts-ignore
        const context = new TextDecoder('gb2312').decode(buffer)
        workbook = XLSX.read(context, { type: 'string', codepage: 936 })
      } else {
        workbook = XLSX.read(buffer)
      }
      // 至此，初步说明文件没有什么问题，清理一下数据
      removeFile()

      /**************************************/
      // 将 xlsx 数据结构转换为 node-xlsx 数据结构，便于页面回显
      // sheets是sheet的数组，每个sheet有两个属性: name - sheet名称 data - sheet数据
      /**************************************/
      const sheets = workbook.SheetNames.map((sheetName) => {
        const xlsxSheet = workbook.Sheets[sheetName]
        // console.log(xlsxSheet)
        const sheetData = XLSX.utils.sheet_to_json<any[]>(xlsxSheet, {
          header: 1, // 表头行数
          defval: '',
          dateNF: 'yyyy-mm-dd' // 日期格式
        })
        return {
          sheetName,
          sheetData
        }
      })

      /**************************************/
      // 表头数据回显
      /**************************************/
      // 表头行元素
      const head = document.createElement('tr')
      // 数据集合--csv默认只有一个sheet，所以只需要取第一个sheet
      const sheetData: any[] = sheets[0].sheetData
      // 表头索引集合，key-表头值，value-表头索引
      const headerIndex = new Map()
      const headerData = sheetData[titleRowIndexValue]
      for (let i = 0; i < headerData.length; i++) {
        if (!headerData[i] || headerData[i].trim() === '') {
          // 表头为空，跳过该列
          continue
        }
        // 保存表头及其索引，便于后续数据解析
        headerIndex.set(headerData[i], i)
        // 创建表头单元格元素
        const th = document.createElement('th')
        th.innerText = headerData[i]
        th.className = 'excel-th'
        th.style.textAlign = 'left'
        head.appendChild(th)
      }
      // 表头数据回显
      excelTableHead.value.appendChild(head)

      // 删除表头以上行数据
      sheetData.splice(0, titleRowIndexValue + 1)

      /**************************************/
      // 数据主题回显
      /**************************************/
      // 时间列的索引
      const timeIndex = headerIndex.get('交易时间')
      sheetData.forEach((row) => {
        // 创建行元素
        const tr = document.createElement('tr')
        // 部分数据字段格式化，并回显
        for (let i = 0; i < row.length; i++) {
          let cellValue = row[i]
          // 创建单元格元素
          const td = document.createElement('td')
          // 日期字段特殊处理，将日期数字转换为 JavaScript 日期对象
          // 目前京东/支付宝/微信可以统一处理
          if (i === timeIndex) {
            // Excel 中日期从1899年12月30日开始
            const excelStartDate = new Date(1899, 11, 30)
            const resultDate = new Date(excelStartDate)
            resultDate.setDate(resultDate.getDate() + cellValue)
            // 添加时区偏移（假设是+8小时）
            resultDate.setHours(resultDate.getHours() + 8)
            // 简单的日期转字符串
            cellValue = resultDate.toISOString().split('T')[0]
            // 将格式化后的字符串重新赋值会sheetData，后续存储需要使用格式化后的的数据
            row[i] = cellValue
          }
          td.innerText = cellValue
          td.className = 'excel-td'
          td.title = cellValue
          tr.appendChild(td)
        }

        /**************************************/
        // 解析数据到实体集合
        /**************************************/
        let flow
        if (fileType.value === 'alipay') {
          flow = alipayConvert(row, headerIndex)
        } else if (fileType.value === 'wxpay') {
          flow = wxpayConvert(row, headerIndex)
        } else if (fileType.value === 'jdFinance') {
          flow = jdFinanceConvert(row, headerIndex)
        } else {
          // 其他数据，暂不处理
          flow = {}
        }
        warningAlert('数据解析完成，请预览并点击【确定导入】保存数据')
        flows.value.push(flow)
        excelTableBody.value.appendChild(tr)
      })

      titleRowIndex.value = titleRowIndexValue
      // 解析后的流水数量
      flowCount.value = flows.value.length
      // data.value.push(sheetData)
    } catch (error) {
      errorAlert('数据解析出错了，请确认文件是否存在问题')
    }
  }

  // 读取文件的内容为文本
  reader.readAsArrayBuffer(file)
}

const excelTable = ref()
const excelTableHead = ref()
const excelTableBody = ref()

// 待上传的流水数据
const flows = ref<Flow[]>([])

// 确定提交
const submitUpload = () => {
  if (flows.value.length === 0) {
    errorAlert('数据为空！')
    return
  }
  uploading.value = true
  importFlows('add', flows.value)
    .then((res) => {
      // console.log(res)
      if (res > 0) {
        successAlert('导入成功, 共导入' + res + '条流水')
        removeFile()
        successCallback()
        showFlowExcelImportDialog.value = false
      } else {
        errorAlert('导入失败，请重试！')
      }
    })
    .catch(() => {
      errorAlert('导入失败，请重试！')
    })
    .finally(() => {
      uploading.value = false
    })
}

const removeFile = () => {
  flows.value = []
  excelTableHead.value ? (excelTableHead.value.innerHTML = '') : ''
  excelTableBody.value ? (excelTableBody.value.innerHTML = '') : ''
  return true
}

onMounted(() => {
  getTypeRelation().then((res) => {
    typeRelation.value = res
  })
})
</script>

<style>
.csv-dialog-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-tip {
  margin-top: 0.5rem;
  color: rgb(237, 137, 137);
}

.excel-table {
  width: 100%;
  max-height: 40rem;
  overflow-y: auto;
  border-collapse: collapse;
}

.excel-th {
  min-width: 6rem;
  max-width: 15rem;
  padding: 0.5rem;
  border-collapse: collapse;
  border: 1px solid;
}

.excel-td {
  min-width: 6rem;
  max-width: 15rem;
  padding: 0.5rem;
  border-collapse: collapse;
  border-bottom: 1px solid;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
