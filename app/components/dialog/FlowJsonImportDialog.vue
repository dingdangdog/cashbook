<template>
  <!-- JSON导入对话框 -->
  <div
    v-if="showFlowJsonImportDialog"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto border border-border"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-4 border-b border-border"
      >
        <h3 class="text-lg font-semibold">JSON 流水导入</h3>
        <button
          @click="closeDialog"
          class="text-foreground/40 hover:text-foreground/70 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 表单内容 -->
      <div class="p-4 space-y-4">
        <!-- 导入模式选择 -->
        <div>
          <label
            class="block text-sm font-medium text-foreground/80 mb-2"
          >
            导入模式
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                type="radio"
                v-model="importFlag"
                value="add"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border"
              />
              <span class="ml-2 text-sm text-foreground/80">
                保留原有流水
              </span>
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                v-model="importFlag"
                value="overwrite"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-border"
              />
              <span class="ml-2 text-sm text-foreground/80">
                删除原有流水
              </span>
            </label>
          </div>
        </div>

        <!-- 文件选择 -->
        <div>
          <label
            class="block text-sm font-medium text-foreground/80 mb-2"
          >
            选择 JSON 文件
          </label>
          <div class="relative">
            <input
              type="file"
              ref="fileInput"
              accept=".json"
              @change="onFileChange"
              class="hidden"
            />
            <button
              @click="() => fileInput?.click()"
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground hover:bg-surface transition-colors text-left flex items-center gap-2"
            >
              <DocumentArrowUpIcon class="h-5 w-5 text-foreground/40" />
              <span class="text-sm">
                {{ jsonFile ? jsonFile.name : "点击选择 JSON 文件" }}
              </span>
            </button>
            <!-- 文件大小显示 -->
            <div
              v-if="jsonFile"
              class="mt-1 text-xs text-foreground/60"
            >
              文件大小: {{ formatFileSize(jsonFile.size) }}
            </div>
          </div>
        </div>

        <!-- 状态提示 -->
        <div class="text-center">
          <div
            v-if="jsonFlows.length > 0"
            class="p-3 bg-primary-500/10 border border-primary-500/20 rounded-md"
          >
            <div class="flex items-center justify-center gap-2">
              <CheckCircleIcon class="h-5 w-5 text-primary-600" />
              <span class="text-sm text-primary-700">
                共解析到 {{ jsonFlows.length }} 条流水数据，可以点击确认导入
              </span>
            </div>
          </div>
          <div
            v-else
            class="p-3 bg-surface-muted border border-border rounded-md"
          >
            <div class="flex items-center justify-center gap-2">
              <ExclamationTriangleIcon class="h-5 w-5 text-foreground/60" />
              <span class="text-sm text-foreground/70">
                请选择要导入的 JSON 文件
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex flex-col sm:flex-row gap-3 p-4 border-t border-border bg-surface-muted"
      >
        <button
          @click="closeDialog"
          class="flex-1 px-4 py-2 text-foreground/80 border border-border rounded-md hover:bg-surface transition-colors"
        >
          取消
        </button>
        <button
          @click="submitImport"
          :disabled="!(jsonFlows.length > 0)"
          class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-secondary-400 disabled:cursor-not-allowed transition-colors"
        >
          确认导入
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showFlowJsonImportDialog } from "~/utils/flag";
import { ref } from "vue";
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";

// ESC键监听
useEscapeKey(() => {
  if (showFlowJsonImportDialog.value) {
    showFlowJsonImportDialog.value = false;
  }
}, showFlowJsonImportDialog);

const { successCallback } = defineProps(["successCallback"]);

const bookId = localStorage.getItem("bookId");

/**
 * 文件上传相关代码
 */
const importFlag = ref("add");
const jsonFile = ref<File | null>(null);
const jsonFlows = ref<Flow[]>([]);
const fileInput = ref<HTMLInputElement>();

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 文件选择处理
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    jsonFile.value = file;
    readJsonInfo();
  } else {
    jsonFile.value = null;
    jsonFlows.value = [];
  }
};

// 读取json文件并导入
const readJsonInfo = () => {
  const file = jsonFile.value;
  if (!file) {
    jsonFlows.value = [];
    return;
  }
  // 创建FileReader对象
  const reader = new FileReader();

  // 设置文件读取完成后的回调函数
  reader.onload = (event) => {
    try {
      // 将读取的文本解析为JSON对象
      jsonFlows.value = JSON.parse(String(event.target?.result));
      jsonFlows.value.forEach((flow) => {
        // 数据处理
        flow.bookId = bookId || "0";
      });
      if (jsonFlows.value.length > 0) {
        Alert.success(
          "共解析到" + jsonFlows.value.length + "条流水数据，可以点击确认导入"
        );
      } else {
        Alert.warning("未发现流水数据，请检查文件哦");
      }
    } catch (error) {
      Alert.error("文件内容好像不太对哦");
    }
  };

  // 读取文件的内容为文本
  reader.readAsText(file);
};

const submitImport = () => {
  // 调用导入接口
  doApi
    .post<any>("api/entry/flow/imports", {
      mode: importFlag.value,
      flows: jsonFlows.value,
      bookId,
    })
    .then((res) => {
      if (res && res.count > 0) {
        Alert.success("导入成功, 共导入" + res.count + "条流水");
        successCallback();
        showFlowJsonImportDialog.value = false;
      } else {
        Alert.error("导入失败，请检查数据！");
      }
    })
    .catch(() => {
      Alert.error("导入失败，服务出错！");
    });
};

const closeDialog = () => {
  showFlowJsonImportDialog.value = false;
};
</script>

<style scoped></style>
