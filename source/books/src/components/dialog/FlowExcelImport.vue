<template>
  <div class="dialog-container">
    <!-- <label for="excel">选择文件</label> -->
    <el-upload
      v-model:file-list="fileList"
      class="upload-demo"
      :auto-upload="false"
      :on-change="importFile"
    >
      <el-button type="primary">选择文件</el-button>
      <template #tip>
        <div class="el-upload__tip">支持xls/xlsx格式文件</div>
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
import xlsx from 'node-xlsx'
// import type { log } from 'console';
// Or var xlsx = require('node-xlsx').default;
import type { UploadProps, UploadUserFile, UploadRawFile } from 'element-plus'

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
    const sheets = xlsx.parse(e.target?.result)
    const sheetData: any[] = sheets[0].data
    const head = document.createElement('tr')
    // 表头
    sheetData[0].forEach((title: any) => {
      const th = document.createElement('th')
      th.innerText = title
      th.classList.add('excel-th')
      th.style.border = 'black 1px solid'
      th.style.textAlign = 'left'
      head.appendChild(th)
    })
    excelTableHead.value.appendChild(head)

    // 删除表头数据
    sheetData.splice(0, 1)

    // 数据
    sheetData.forEach((row) => {
      const tr = document.createElement('tr')
      row.forEach((value: any) => {
        const td = document.createElement('td')
        td.innerText = value
        td.classList.add('excel-td')
        td.style.border = 'black 1px solid'
        tr.appendChild(td)
      })
      excelTableBody.value.appendChild(tr)
    })
    data.value.push(sheetData)
  }
  await reader.readAsArrayBuffer(file)
  console.log(data.value)
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  border: black 1px solid;
  width: 100%;
}

.excel-th {
  padding: 20px 0;
  width: auto;
  border-collapse: collapse;
  border: black 1px solid;
}

.excel-td {
  padding: 5px 10px;
  width: 2rem;
  border-collapse: collapse;
  border: black 1px solid;
}
</style>
