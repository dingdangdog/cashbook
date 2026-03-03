<template>
  <!-- 流水小票编辑对话框 -->
  <div
    v-if="showFlowEditInvoiceDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    style="z-index: 999"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          上传小票
        </h3>
        <button
          @click="closeDialog"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 表单内容 -->
      <div class="p-4 space-y-6">
        <!-- 现有小票 -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            现有小票
          </h4>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="(img, index) in invoices"
              :key="index"
              @mouseover="isHovering = img"
              @mouseleave="isHovering = ''"
              class="relative w-24 h-24 cursor-pointer group rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-red-500 transition-colors"
              @click="removeInvoice(img)"
            >
              <img
                :src="invoiceImage[img]"
                class="w-full h-full object-cover"
                :alt="`小票 ${index + 1}`"
              />
              <!-- 删除悬停遮罩 -->
              <div
                v-if="isHovering === img"
                class="absolute inset-0 bg-red-500 bg-opacity-70 flex items-center justify-center"
              >
                <TrashIcon class="w-6 h-6 text-white" />
              </div>
            </div>
            <div
              v-if="invoices.length === 0"
              class="text-sm text-gray-500 dark:text-gray-400 py-8 text-center w-full border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg"
            >
              <DocumentIcon class="w-8 h-8 mx-auto mb-2 text-gray-400" />
              暂无小票
            </div>
          </div>
        </div>

        <!-- 新小票上传 -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            新小票
          </h4>
          <div class="relative">
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              @change="onFileChange"
              class="hidden"
            />
            <button
              @click="() => fileInput?.click()"
              class="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <PhotoIcon class="h-6 w-6 text-gray-400" />
              <span class="text-sm">
                {{ newInvoice ? newInvoice.name : "点击选择小票图片" }}
              </span>
            </button>
            <!-- 文件信息 -->
            <div
              v-if="newInvoice"
              class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-300"
            >
              <div class="flex items-center gap-2">
                <CheckCircleIcon class="h-4 w-4" />
                <span
                  >{{ newInvoice.name }} ({{
                    formatFileSize(newInvoice.size)
                  }})</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex flex-col sm:flex-row gap-3 p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          type="button"
          @click="closeDialog"
          class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          取消
        </button>
        <button
          type="button"
          @click="uploadInvoiceFile"
          :disabled="!newInvoice"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          上传
        </button>
      </div>
    </div>
  </div>

  <!-- 删除确认对话框 -->
  <div
    v-if="deleteInvoiceConfirmDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    style="z-index: 10000"
    @click.self="cancelDeleteInvoice"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          确定删除小票吗？
        </h3>
      </div>

      <!-- 内容 -->
      <div class="p-4">
        <div class="flex justify-center mb-4">
          <img
            :src="invoiceImage[deleteInvoice]"
            class="max-w-60 max-h-60 rounded-lg border border-gray-200 dark:border-gray-600"
            :alt="'要删除的小票'"
          />
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
          删除后无法恢复，请确认是否删除此小票？
        </p>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex flex-col sm:flex-row gap-3 p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          type="button"
          @click="cancelDeleteInvoice"
          class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          取消
        </button>
        <button
          type="button"
          @click="confirmDeleteInvoice"
          class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          确定删除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showFlowEditInvoiceDialog } from "~/utils/flag";
import { ref, nextTick } from "vue";
import {
  XMarkIcon,
  TrashIcon,
  PhotoIcon,
  DocumentIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";

// ESC键监听
useEscapeKey(() => {
  if (showFlowEditInvoiceDialog.value) {
    showFlowEditInvoiceDialog.value = false;
  }
}, showFlowEditInvoiceDialog);

const { successCallback, item } = defineProps(["successCallback", "item"]);

const editInvoice = ref<Flow | any>({});
editInvoice.value = { ...item };
const invoices = ref<string[]>([]);
const fileInput = ref<HTMLInputElement>();
const newInvoice = ref<File | null>(null);

const getInvoiceImage = async (invoice: string) => {
  if (!invoice || invoice === "") {
    return "";
  }
  try {
    const res = await doApi.download("api/entry/flow/invoice/show", {
      invoice,
    });
    return res ? URL.createObjectURL(res) : res;
  } catch (e) {
    return "";
  }
};

const invoiceImage = ref<Record<string, string>>({});

const initInvoiceImage = () => {
  if (editInvoice.value.invoice) {
    invoices.value = [];
    for (let invoice of editInvoice.value.invoice?.split(",")) {
      getInvoiceImage(invoice).then((res) => {
        invoices.value.push(invoice);
        invoiceImage.value[invoice] = res;
      });
    }
  }
};
initInvoiceImage();

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
    newInvoice.value = file;
  } else {
    newInvoice.value = null;
  }
};

const uploadInvoiceFile = () => {
  if (!newInvoice.value) {
    Alert.error("未选择小票");
    return;
  }
  const formdata = new FormData();
  formdata.append("id", editInvoice.value.id);
  formdata.append("bookId", localStorage.getItem("bookId") || "");
  formdata.append("invoice", newInvoice.value);

  doApi.postform("api/entry/flow/invoice/upload", formdata).then((res) => {
    Alert.success("上传成功");
    editInvoice.value = res;
    closeDialog();
    // 使用 nextTick 确保对话框关闭后再刷新列表
    nextTick(() => {
      if (successCallback && typeof successCallback === "function") {
        successCallback();
      }
    });
  });
};

const closeDialog = () => {
  showFlowEditInvoiceDialog.value = false;
  // successCallback();
};

const isHovering = ref("");
const removeInvoice = (img: string) => {
  deleteInvoice.value = img;
  deleteInvoiceConfirmDialog.value = true;
};

const deleteInvoice = ref();
const deleteInvoiceConfirmDialog = ref(false);

const confirmDeleteInvoice = () => {
  doApi
    .post("api/entry/flow/invoice/del", {
      id: editInvoice.value.id,
      bookId: localStorage.getItem("bookId"),
      invoice: deleteInvoice.value,
    })
    .then((res) => {
      editInvoice.value = res;
      Alert.success("删除成功!");
      deleteInvoiceConfirmDialog.value = false;
      closeDialog();
      // 使用 nextTick 确保对话框关闭后再刷新列表
      nextTick(() => {
        if (successCallback && typeof successCallback === "function") {
          successCallback();
        }
      });
    })
    .catch(() => {
      Alert.error("删除失败!");
    });
};

const cancelDeleteInvoice = () => {
  deleteInvoice.value = "";
  deleteInvoiceConfirmDialog.value = false;
};
</script>

<style scoped></style>
