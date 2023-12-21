<template>
  <div class="dialog-container">
    <el-upload
      v-model:file-list="fileList"
      class="upload-demo"
      :auto-upload="false"
      :on-change="importFile"
      :before-remove="removeFile"
    >
<!--      <el-button type="warning" @click="clickButton('none')">打开文件</el-button>-->
      <el-button type="primary" @click="clickButton('alipay')">打开支付宝文件</el-button>
      <el-button type="success" @click="clickButton('wxpay')">打开微信文件</el-button>
      <template #tip>
        <div><br/>
          <span style="color:red">1、目前仅支持移动端`支付宝`/`微信`导出的CSV账单文件；</span>&nbsp;&nbsp;&nbsp;&nbsp;<br/>
          <span style="color:red">2、目前仅会导入`支出`/`收入`数据，`不计收支`等特殊数据不会导入；</span>&nbsp;&nbsp;&nbsp;&nbsp;<br/>
          <span style="color:red">3、选择文件后可以预览文件数据；</span>&nbsp;&nbsp;&nbsp;&nbsp;<br/>
          <span style="color:red">4、选择文件后请点击此按钮开始上传：</span><el-button type="primary" @click="submitUpload">确定导入</el-button>
        </div>
      </template>
    </el-upload>

    <table ref="excelTable">
      <thead ref="excelTableHead"></thead>
      <tbody ref="excelTableBody"></tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { ElMessage, ElMessageBox, type UploadProps, type UploadRawFile, type UploadUserFile } from 'element-plus'

import router from '@/router'
import type { Flow } from '@/types/model/flow'
import { alipayConvert, wxpayConvert } from '@/utils/flowConvert'
import { importFlows } from '@/api/api.flow'
import { showExcelImportDialogFlag } from '@/stores/flag'

// 上传文件类型标识：none-未知文件；alipay-支付宝
const fileType = ref('none')

const clickButton = (type: string) => {
  fileType.value = type
}

const excelTable = ref()
const excelTableHead = ref()
const excelTableBody = ref()
const data = ref<any[]>([])
const fileList = ref<UploadUserFile[]>([])

const flows = ref<Flow[]>([])

// 选择文件后，自动解析文件内容
const importFile: UploadProps['onChange'] = async (uploadFile, _uploadFiles) => {
  //导入
  if (!uploadFile.raw) {
    return
  }
  const file: UploadRawFile = uploadFile.raw

  const reader = new FileReader()
  // 文件内容解析逻辑
  reader.onload = function(e) {
    // 文件数据ArrayBuffer
    const buffer = e.target?.result
    // 待保存excel实体
    let workbook: XLSX.WorkBook
    // 表头行号
    let headRowIndex = 0

    /**************************************/
    // 不同数据格式前置处理
    /**************************************/
    if (fileType.value === 'alipay') {
      // 支付宝表头行是第25行，索引是24
      headRowIndex = 24
      // 阿里csv账单为GB2312编码，需要特殊处理，擦
      const context = new TextDecoder('gb2312').decode(buffer)
      workbook = XLSX.read(context, { type: 'string', codepage: 936 })
    } else if (fileType.value === 'wxpay') {
      // 微信表头行是第17行，索引是16
      headRowIndex = 16
      workbook = XLSX.read(buffer)
    } else {
      workbook = XLSX.read(buffer)
    }

    /**************************************/
    // 将 xlsx 数据结构转换为 node-xlsx 数据结构，便于页面回显
    /**************************************/
    const sheets = workbook.SheetNames.map(sheetName => {
      const xlsxSheet = workbook.Sheets[sheetName]
      console.log(xlsxSheet)
      // dateNF不管用啊！！！
      const data = XLSX.utils.sheet_to_json<any[]>(xlsxSheet, { header: 1, defval: '', dateNF: 'yyyy-mm-dd' })
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
    for (let i = 0; i < sheetData[headRowIndex].length; i++) {
      // 保存表头及其索引，便于后续数据解析
      titleIndex.set(sheetData[headRowIndex][i], i)
      // 创建表头单元格元素
      const th = document.createElement('th')
      th.innerText = sheetData[headRowIndex][i]
      th.className = 'excel-th'
      th.style.textAlign = 'left'
      head.appendChild(th)
    }
    excelTableHead.value.appendChild(head)

    // 删除表头以上行数据
    sheetData.splice(0, headRowIndex + 1)

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
        if ((fileType.value === 'alipay' || fileType.value === 'wxpay') && i === timeIndex) {
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
      } else {
        // 其他数据，暂不处理
        flow = {}
      }
      if (flow.flowType === '支出' || flow.flowType === '收入') {
        flows.value.push(flow)
      }
      excelTableBody.value.appendChild(tr)
    })

    data.value.push(sheetData)
  }
  reader.readAsArrayBuffer(file)
  // console.log(data.value)
}

// 确定提交
const submitUpload = () => {
  importFlows('add', flows.value).then((res) => {
    console.log(res)
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
          router.push({ path: '/index/flows' })
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
  excelTableHead.value.innerHTML = ''
  excelTableBody.value.innerHTML = ''
  return true
}
</script>

<style>
table {
  border-collapse: collapse;
  /* border: 1px solid; */
  width: 100%;
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
