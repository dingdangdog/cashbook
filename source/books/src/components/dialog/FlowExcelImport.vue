<template>
  <div class="dialog-container">
    <!-- <label for="excel">选择文件</label> -->
    <span style="color:red">目前仅支持单Sheet页文件</span>&nbsp;&nbsp;&nbsp;&nbsp;
    <el-button type="primary">确定导入</el-button>
    <br/>
    <hr/>
    <el-upload
      v-model:file-list="fileList"
      class="upload-demo"
      :auto-upload="false"
      :on-change="importFile"
      :before-remove="removeFile"
    >
      <el-button type="warning" @click="clickButton('none')">打开文件</el-button>
      <el-button type="primary" @click="clickButton('alipay')">打开支付宝文件</el-button>
      <el-button type="success" @click="clickButton('wxpay')">打开微信文件</el-button>
      <template #tip>
        <div class="el-upload__tip">支持csv/xls/xlsx格式文件</div>
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
import type { UploadProps, UploadUserFile, UploadRawFile } from 'element-plus'

const fileType = ref("none");

const clickButton = (type: string) => {
  fileType.value = type
}

const excelTable = ref()
const excelTableHead = ref()
const excelTableBody = ref()
const data = ref<any[]>([])
const fileList = ref<UploadUserFile[]>([])

const importFile: UploadProps['onChange'] = async (uploadFile, _uploadFiles) => {
  // console.log(uploadFile, uploadFiles)
  //导入
  if (!uploadFile.raw) {
    return
  }
  const file: UploadRawFile = uploadFile.raw
  // console.log(file, 'file')

  const reader = new FileReader()
  reader.onload = function (e) {
    // 文件数据buffer
    const buffer = e.target?.result
    // excel实体
    let workbook: XLSX.WorkBook;
    // 表头行号
    let headRowIndex = 0;
    if (fileType.value === "alipay"){
      headRowIndex = 24
      const context = new TextDecoder('gb2312').decode(buffer)
      workbook = XLSX.read(context, {type: 'string', codepage: 936})
    } else if (fileType.value === "wxpay"){
      headRowIndex = 16
      // const context = new TextDecoder('gb2312').decode(buffer)
      workbook = XLSX.read(buffer)
    } else {
      // const context = new TextDecoder().decode(buffer)
      workbook = XLSX.read(buffer)
    }

    // 将 xlsx 数据结构转换为 node-xlsx 数据结构
    const sheets = workbook.SheetNames.map(sheetName => {
      const xlsxSheet = workbook.Sheets[sheetName];
      console.log(xlsxSheet)
      // dateNF不管用啊！！！
      const data = XLSX.utils.sheet_to_json<any[]>(xlsxSheet, { header: 1, defval: '', dateNF:'yyyy-mm-dd', cellText: true});
      return {
        name: sheetName,
        data: data,
      };
    });
    // console.log(sheets)
    // 表头元素
    const head = document.createElement('tr')
    // 数据集合
    const sheetData: any[] = sheets[0].data
    // console.log(sheetData)

    // 表头
    sheetData[headRowIndex].forEach((title: any) => {
      const th = document.createElement('th')
      th.innerText = title
      th.className = 'excel-th'
      // th.style.border = '#FFF 1px solid'
      th.style.textAlign = 'left'
      head.appendChild(th)
    })
    excelTableHead.value.appendChild(head)

    // 删除表头以上行数据
    sheetData.splice(0, headRowIndex +1)

    // 数据
    sheetData.forEach((row) => {
      const tr = document.createElement('tr')
      let cellIndex = 0;
      row.forEach((cellValue: any) => {
        const td = document.createElement('td')
        if ((fileType.value === 'alipay' || fileType.value ==='wxpay') && cellIndex === 0) {
          // 将日期数字转换为 JavaScript 日期对象
          const excelStartDate = new Date(1899, 11, 30); // Excel 中日期从1899年12月30日开始
          const resultDate = new Date(excelStartDate);
          resultDate.setDate(resultDate.getDate() + cellValue);
          // 添加时区偏移（假设是+8小时）
          resultDate.setHours(resultDate.getHours() + 8);
          cellValue = resultDate.toISOString().split('T')[0];
          // console.log(cellIndex)
        }
        td.innerText = cellValue
        td.className = 'excel-td'
        // td.style.border = 'black 1px solid'
        tr.appendChild(td)
        cellIndex++;
      })
      excelTableBody.value.appendChild(tr)
    })
    data.value.push(sheetData)
  }
  await reader.readAsArrayBuffer(file)
  // console.log(data.value)
}

const removeFile = () => {
  data.value = []
  excelTableHead.value.innerHTML = ""
  excelTableBody.value.innerHTML = ""
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
