<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- 表格容器 -->
    <div class="max-h-[60vh] overflow-auto">
      <table ref="excelTable" class="w-full border-collapse">
        <thead ref="excelTableHead" class="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10"></thead>
        <tbody ref="excelTableBody" class="divide-y divide-gray-200 dark:divide-gray-700"></tbody>
      </table>
    </div>

    <!-- 分隔线 -->
    <div class="border-t border-gray-200 dark:border-gray-700"></div>

    <!-- 底部操作栏 -->
    <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700">
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <!-- 左侧信息 -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            解析到的流水数量: 
            <span class="font-semibold text-blue-600 dark:text-blue-400">{{ flows.length }}</span>
          </span>
        </div>

        <!-- 右侧操作 -->
        <div class="flex gap-3 items-center">
          <!-- 流水归属输入 -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              流水归属:
            </label>
            <input
              v-model="attribution"
              type="text"
              placeholder="可选"
              class="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-green-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- 确定导入按钮 -->
          <button
            @click="submitUpload"
            :disabled="uploading"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <div v-if="uploading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <CloudArrowUpIcon v-else class="h-4 w-4" />
            {{ uploading ? '导入中...' : '确定导入' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { CloudArrowUpIcon } from "@heroicons/vue/24/outline";

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
    head.className = "border-b border-gray-200 dark:border-gray-600";
    
    for (let h in tableHead) {
      // 创建表头单元格元素
      const th = document.createElement("th");
      th.innerText = h;
      th.className = "px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700";
      th.style.textAlign = "left";
      head.appendChild(th);
    }
    // 表头数据回显
    excelTableHead.value.appendChild(head);
  }
  
  if (excelTableBody.value) {
    for (let row of tableBody) {
      // 创建行元素
      const tr = document.createElement("tr");
      tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
      
      // 部分数据字段格式化，并回显
      for (let c of row) {
        let cellValue = c;
        // 创建单元格元素
        const td = document.createElement("td");
        td.innerText = cellValue;
        td.className = "px-3 py-2 text-sm text-gray-900 dark:text-gray-100 max-w-32 truncate border-b border-gray-200 dark:border-gray-700";
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

<style scoped>
/* 自定义滚动条样式 */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-700;
}

.overflow-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
</style>
