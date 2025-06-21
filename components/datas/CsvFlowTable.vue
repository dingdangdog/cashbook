<template>
  <div class="dialog-container">
    <div class="excel-table flex justify-center">
      <table ref="excelTable" class="flex flex-col">
        <thead ref="excelTableHead"></thead>
        <tbody
          ref="excelTableBody"
          class="flex-1 overflow-y-auto"
        ></tbody>
      </table>
    </div>
    <hr />
    <div class="csv-dialog-header space-x-4" style="margin-top: 1rem">
      <div class="flex items-center">
        <span style="color: gray" class="mx-2"
          >解析到的流水数量:{{ flows.length }}</span
        >
      </div>
      <div class="flex items-center">
        <!-- <span class="mr-2">流水归属:</span> -->
        <v-text-field
          v-model="attribution"
          placeholder="流水归属(可选)"
          variant="outlined"
          density="compact"
          hide-details="auto"
          class="w-36"
        ></v-text-field>
      </div>
      <v-btn
        variant="elevated"
        color="primary"
        @click="submitUpload"
        :disabled="uploading"
        >确定导入</v-btn
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const { items, tableHead, tableBody, successCallback } = defineProps([
  "items",
  "tableHead",
  "tableBody",
  "successCallback",
]);

// console.log(items, tableHead, tableBody);

const uploading = ref(false);
// 待上传的流水数据
const flows = ref<Flow[]>([]);
flows.value.push(...items);

// 流水归属
const attribution = ref("");

const excelTable = ref();
const excelTableHead = ref();
const excelTableBody = ref();

// 读取json文件并导入
onMounted(() => {
  if (excelTableHead.value) {
    // 表头行元素
    const head = document.createElement("tr");
    for (let h in tableHead) {
      // 创建表头单元格元素
      const th = document.createElement("th");
      th.innerText = h;
      th.className = "excel-th";
      th.style.textAlign = "left";
      head.appendChild(th);
    }
    // 表头数据回显
    excelTableHead.value.appendChild(head);
  }
  if (excelTableHead.value) {
    for (let row of tableBody) {
      // 创建行元素
      const tr = document.createElement("tr");
      // 部分数据字段格式化，并回显
      for (let c of row) {
        let cellValue = c;
        // 创建单元格元素
        const td = document.createElement("td");
        td.innerText = cellValue;
        td.className = "excel-td";
        td.title = cellValue;
        tr.appendChild(td);
      }
      excelTableBody.value.appendChild(tr);
    }
  }
});

// 确定提交
const submitUpload = () => {
  if (flows.value.length === 0) {
    Alert.error("数据为空！");
    return;
  }

  // 如果设置了流水归属，应用到所有流水
  if (attribution.value.trim()) {
    flows.value.forEach((flow) => {
      flow.attribution = attribution.value.trim();
    });
  }

  uploading.value = true;
  doApi
    .post("api/entry/flow/imports", {
      flows: flows.value,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res: any) => {
      // console.log(res)
      if (res && res.count > 0) {
        Alert.success("导入成功, 共导入" + res.count + "条流水");
        successCallback();
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
</script>

<style>
.csv-dialog-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: end;
}

.upload-tip {
  margin-top: 0.5rem;
  color: rgb(237, 137, 137);
}

.excel-table {
  border-collapse: collapse;
  margin: 0 auto;
  max-height: 80vh;
  max-width: 90vw;
  overflow-y: auto;
}

.excel-table tbody tr:nth-child(odd) {
  background-color: rgba(70, 70, 70, 0.3);
}

.excel-table tbody tr:nth-child(even) {
  background-color: rgba(30, 30, 30, 0.3);
}

.excel-th {
  width: 8rem;
  padding: 0.5rem;
  border-collapse: collapse;
  border: 1px solid;
  /* color: rgb(198, 234, 205); */
  background-color: rgba(10, 10, 10, 0.3);
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
  /* color: rgb(162, 183, 167); */
}
</style>
