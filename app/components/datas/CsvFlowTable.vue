<template>
  <div class="bg-surface text-foreground rounded-lg shadow-sm border border-border overflow-hidden">
    <!-- 表格容器 -->
    <div class="max-h-[60vh] overflow-auto">
      <table ref="excelTable" class="w-full border-collapse">
        <thead ref="excelTableHead" class="bg-surface-muted sticky top-0 z-10"></thead>
        <tbody ref="excelTableBody" class="divide-y divide-border"></tbody>
      </table>
    </div>

    <!-- 分隔线 -->
    <div class="border-t border-border"></div>

    <!-- 底部操作栏 -->
    <div class="px-4 py-3 bg-surface-muted">
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <!-- 左侧信息 -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-foreground/70">
            解析到的流水数量: 
            <span class="font-semibold text-primary-600">{{ flows.length }}</span>
          </span>
        </div>

        <!-- 右侧操作 -->
        <div class="flex gap-3 items-center">
          <!-- 流水归属输入 -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-foreground/80 whitespace-nowrap">
              流水归属:
            </label>
            <input
              v-model="attribution"
              type="text"
              placeholder="可选"
              class="w-32 px-2 py-1 text-sm border border-border rounded bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- 确定导入按钮 -->
          <button
            @click="submitUpload"
            :disabled="uploading"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
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
    head.className = "border-b border-border";
    
    for (let h in tableHead) {
      // 创建表头单元格元素
      const th = document.createElement("th");
      th.innerText = h;
      th.className =
        "px-3 py-2 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider bg-surface-muted";
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
      tr.className = "hover:bg-surface-muted transition-colors";
      
      // 部分数据字段格式化，并回显
      for (let c of row) {
        let cellValue = c;
        // 创建单元格元素
        const td = document.createElement("td");
        td.innerText = cellValue;
        td.className =
          "px-3 py-2 text-sm text-foreground max-w-32 truncate border-b border-border";
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
      mode: "add",
      flows: flows.value,
    })
    .then((res: any) => {
      if (res && typeof res.count === "number") {
        const msg =
          res.skipped > 0
            ? `导入成功，共导入 ${res.count} 条流水，已跳过 ${res.skipped} 条重复`
            : `导入成功，共导入 ${res.count} 条流水`;
        Alert.success(msg);
        successCallback();
        showFlowExcelImportDialog.value = false;
      } else if (res && res.count === 0 && res.skipped > 0) {
        Alert.warning(`未新增流水，共跳过 ${res.skipped} 条重复`);
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
  background-color: rgb(var(--color-surface-muted));
}

.overflow-auto::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-secondary-300));
  border-radius: 9999px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-secondary-400));
}
</style>
