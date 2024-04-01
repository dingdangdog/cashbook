<template>
  <div class="dialog-container">
    <el-upload
      v-model:file-list="fileList"
      class="upload-element"
      :auto-upload="false"
      :on-change="changeFile"
      :before-remove="removeFile"
    >
      <div class="file-buttons">
        <el-button type="primary" @click="clickButton('alipay')">支付宝文件</el-button>
        <el-button type="success" @click="clickButton('wxpay')">微信文件</el-button>
        <el-button type="danger" @click="clickButton('jdFinance')">京东金融</el-button>
      </div>
      <br />
      <template #tip>
        <div class="upload-info">
          <span class="upload-tip"
            >1、目前仅支持移动端 <b>支付宝/微信/京东金融</b> 导出的 <b>CSV</b> 账单文件；</span
          >
          <span class="upload-tip"
            >2、导入数据默认分为 <b>支出/收入/不计收支</b> 三种流水类型；</span
          >
          <span class="upload-tip"
            >3、选择文件后可以预览数据，只有点击
            <el-button type="primary" @click="submitUpload">确定导入</el-button>
            后才会上传数据。</span
          >
        </div>
      </template>
    </el-upload>
    <el-row class="file-param">
      <el-form-item label="标题索引" prop="titleRowIndex">
        <el-tooltip content="标题行的索引，从0开始，如：微信默认第17行是标题行，则索引是16">
          <el-icon style="margin-right: 1rem !important">
            <Warning />
          </el-icon>
        </el-tooltip>
        <el-input-number
          v-model="titleRowIndex"
          name="titleRowIndex"
          disabled
          id="titleRowIndexInput"
        ></el-input-number>
      </el-form-item>
      &nbsp;&nbsp;
      <el-form-item label="流水数量" prop="flowCount">
        <el-input-number
          v-model="flowCount"
          name="flowCount"
          disabled
          id="flowCountInput"
        ></el-input-number>
      </el-form-item>
    </el-row>
  </div>
  <table ref="excelTable" class="excel-table">
    <thead ref="excelTableHead"></thead>
    <tbody ref="excelTableBody"></tbody>
  </table>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import * as XLSX from 'xlsx'
import {
  ElMessage,
  ElMessageBox,
  type UploadFile,
  type UploadFiles,
  type UploadProgressEvent,
  type UploadProps,
  type UploadRawFile,
  type UploadUserFile
} from 'element-plus'
import { Warning } from '@element-plus/icons-vue'

import type { Flow } from '@/types/model/flow'
import { alipayConvert, jdFinanceConvert, wxpayConvert } from '@/utils/flowConvert'
import { importFlows } from '@/api/api.flow'
import { showExcelImportDialogFlag } from '@/stores/flag'
import type { FlowExport } from '@/types/view'
import { getTypeRelation } from '@/api/api.typer'
import { typeRelation } from '@/utils/store'

// 上传文件类型标识：none-未知文件；alipay-支付宝
const fileType = ref('none')
// 表头行索引
const titleRowIndex = ref(0)
let titleRowIndexValue = 0
// 解析后的流水数量
const flowCount = ref(0)

const clickButton = (type: string) => {
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
}

const excelTable = ref()
const excelTableHead = ref()
const excelTableBody = ref()
const data = ref<any[]>([])
const fileList = ref<UploadUserFile[]>([])
// 待上传的流水数据
const flows = ref<Flow[]>([])

// 解析上传的文件数据
const parseData = (uploadFile: UploadFile, _uploadFiles: UploadFiles) => {
  //导入
  if (!uploadFile.raw) {
    return
  }
  const file: UploadRawFile = uploadFile.raw

  const reader = new FileReader()
  // 文件内容解析逻辑
  reader.onload = function (e) {
    // 文件数据ArrayBuffer
    const buffer = e.target?.result
    // 待保存excel实体
    let workbook: XLSX.WorkBook

    /**************************************/
    // 不同编码格式读取
    /**************************************/
    if (fileType.value === 'alipay') {
      // 阿里csv账单为GB2312编码，需要特殊处理，擦
      const context = new TextDecoder('gb2312').decode(buffer)
      workbook = XLSX.read(context, { type: 'string', codepage: 936 })
    } else {
      workbook = XLSX.read(buffer)
    }

    /**************************************/
    // 将 xlsx 数据结构转换为 node-xlsx 数据结构，便于页面回显
    /**************************************/
    const sheets = workbook.SheetNames.map((sheetName) => {
      const xlsxSheet = workbook.Sheets[sheetName]
      // console.log(xlsxSheet)
      const data = XLSX.utils.sheet_to_json<any[]>(xlsxSheet, {
        header: 1,
        defval: '',
        dateNF: 'yyyy-mm-dd'
      })
      return {
        name: sheetName,
        data: data
      }
    })

    /**************************************/
    // 表头数据回显
    /**************************************/
    // 表头行元素
    const head = document.createElement('tr')
    // 数据集合
    const sheetData: any[] = sheets[0].data
    // 表头索引集合
    const titleIndex = new Map()
    for (let i = 0; i < sheetData[titleRowIndexValue].length; i++) {
      // 保存表头及其索引，便于后续数据解析
      titleIndex.set(sheetData[titleRowIndexValue][i], i)
      // 创建表头单元格元素
      const th = document.createElement('th')
      th.innerText = sheetData[titleRowIndexValue][i]
      th.className = 'excel-th'
      th.style.textAlign = 'left'
      head.appendChild(th)
    }
    excelTableHead.value.appendChild(head)

    // 删除表头以上行数据
    sheetData.splice(0, titleRowIndexValue + 1)

    /**************************************/
    // 数据主题回显
    /**************************************/
    sheetData.forEach((row) => {
      // 创建行元素
      const tr = document.createElement('tr')
      const timeIndex = titleIndex.get('交易时间')
      // 部分数据字段格式化，并回显
      for (let i = 0; i < row.length; i++) {
        let cellValue = row[i]
        // 创建单元格元素
        const td = document.createElement('td')
        // 将日期数字转换为 JavaScript 日期对象
        if (
          (fileType.value === 'alipay' ||
            fileType.value === 'wxpay' ||
            fileType.value === 'jdFinance') &&
          i === timeIndex
        ) {
          // Excel 中日期从1899年12月30日开始
          const excelStartDate = new Date(1899, 11, 30)
          const resultDate = new Date(excelStartDate)
          resultDate.setDate(resultDate.getDate() + cellValue)
          // 添加时区偏移（假设是+8小时）
          resultDate.setHours(resultDate.getHours() + 8)
          // 简单的日期转字符串
          cellValue = resultDate.toISOString().split('T')[0]
          row[i] = cellValue
        }
        td.innerText = cellValue
        td.className = 'excel-td'
        tr.appendChild(td)
      }

      /**************************************/
      // 解析数据到实体集合
      /**************************************/
      let flow
      if (fileType.value === 'alipay') {
        flow = alipayConvert(row, titleIndex)
      } else if (fileType.value === 'wxpay') {
        flow = wxpayConvert(row, titleIndex)
      } else if (fileType.value === 'jdFinance') {
        flow = jdFinanceConvert(row, titleIndex)
      } else {
        // 其他数据，暂不处理
        flow = {}
      }
      flows.value.push(flow)
      excelTableBody.value.appendChild(tr)
    })

    titleRowIndex.value = titleRowIndexValue
    // 解析后的流水数量
    flowCount.value = flows.value.length
    data.value.push(sheetData)
  }
  reader.readAsArrayBuffer(file)
  // console.log(data.value)
}

// 选择文件后，自动解析文件内容
const changeFile: UploadProps['onChange'] = async (
  uploadFile: UploadFile,
  _uploadFiles: UploadFiles
) => {
  console.log(uploadFile, _uploadFiles)
  removeFile()
  if (_uploadFiles.length > 1) {
    _uploadFiles.splice(0, _uploadFiles.length - 1)
  }
  console.log(uploadFile, _uploadFiles)
  parseData(uploadFile, _uploadFiles)
}

const flowMethods: FlowExport | undefined = inject('flowMethods')

// 确定提交
const submitUpload = () => {
  if (flows.value.length === 0) {
    ElMessage.error('数据为空！')
    return
  }
  importFlows('add', flows.value)
    .then((res) => {
      // console.log(res)
      if (res > 0) {
        ElMessageBox.alert('共导入' + res + '条流水', '导入成功', {
          confirmButtonText: '确定',
          callback: () => {
            // 清空数据
            data.value = []
            flows.value = []
            excelTableHead.value.innerHTML = ''
            excelTableBody.value.innerHTML = ''
            showExcelImportDialogFlag.value.visible = false
            flowMethods?.query()
          }
        })
      } else {
        ElMessage.error('导入失败，请重试！')
      }
    })
    .catch(() => {
      ElMessage.error('导入失败，请重试！')
    })
}

const removeFile = () => {
  data.value = []
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
.el-dialog__body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid;
}
.dialog-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.file-buttons,
.upload-element,
.file-param {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.upload-element,
.upload-info {
  flex-direction: column;
}
.upload-info {
  flex: 1;
  display: flex;
  width: 30rem;
  text-align: left; /* 将内容左对齐 */
}
.upload-tip {
  margin-top: 0.5rem;
  color: red;
}

.excel-table {
  flex: 1;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  border-collapse: collapse;
}

.excel-th {
  padding: 0.5rem;
  width: auto;
  border-collapse: collapse;
  border: 1px solid;
}

.excel-td {
  padding: 0.5rem;
  width: 2rem;
  border-collapse: collapse;
  border: 1px solid;
}
</style>
