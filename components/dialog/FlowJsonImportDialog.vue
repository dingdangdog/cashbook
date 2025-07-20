<template>
  <!-- JSON导入对话框 -->
  <div
    v-if="showFlowJsonImportDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          JSON 流水导入
        </h3>
        <button
          @click="closeDialog"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 表单内容 -->
      <div class="p-4 space-y-4">
        <!-- 导入模式选择 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            导入模式
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                type="radio"
                v-model="importFlag"
                value="add"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                保留原有流水
              </span>
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                v-model="importFlag"
                value="overwrite"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                删除原有流水
              </span>
            </label>
          </div>
        </div>

        <!-- 文件选择 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-left flex items-center gap-2"
            >
              <DocumentArrowUpIcon class="h-5 w-5 text-gray-400" />
              <span class="text-sm">
                {{ jsonFile ? jsonFile.name : "点击选择 JSON 文件" }}
              </span>
            </button>
            <!-- 文件大小显示 -->
            <div
              v-if="jsonFile"
              class="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              文件大小: {{ formatFileSize(jsonFile.size) }}
            </div>
          </div>
        </div>

        <!-- 状态提示 -->
        <div class="text-center">
          <div
            v-if="jsonFlows.length > 0"
            class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
          >
            <div class="flex items-center justify-center gap-2">
              <CheckCircleIcon
                class="h-5 w-5 text-green-600 dark:text-green-400"
              />
              <span class="text-sm text-green-800 dark:text-green-300">
                共解析到 {{ jsonFlows.length }} 条流水数据，可以点击确认导入
              </span>
            </div>
          </div>
          <div
            v-else
            class="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md"
          >
            <div class="flex items-center justify-center gap-2">
              <ExclamationTriangleIcon
                class="h-5 w-5 text-orange-600 dark:text-orange-400"
              />
              <span class="text-sm text-orange-800 dark:text-orange-300">
                请选择要导入的 JSON 文件
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex flex-col sm:flex-row gap-3 p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          @click="closeDialog"
          class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          取消
        </button>
        <button
          @click="submitImport"
          :disabled="!(jsonFlows.length > 0)"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
