<script setup lang="ts">
import { openConfirmDialogFlag, ThisConfirmModel } from "~/utils/confirm";

const cancel = () => {
  if (ThisConfirmModel.value && ThisConfirmModel.value.cancel) {
    ThisConfirmModel.value.cancel();
  }
  closeConfirm();
};
const close = () => {
  if (ThisConfirmModel.value && ThisConfirmModel.value.close) {
    ThisConfirmModel.value.close();
  }
  closeConfirm();
};
const confirm = () => {
  ThisConfirmModel.value?.confirm();
  closeConfirm();
};
const closeConfirm = () => {
  openConfirmDialogFlag.value = false;
  // ThisConfirmModel.value = model;

  // if (GlobalConfirmModels.value.length > 0) {
  //   setTimeout(() => {
  //     const model = GlobalConfirmModels.value.shift();
  //     openConfirmDialogFlag.value = true;
  //   }, 100);
  // }
};
</script>

<template>
  <!-- 确认对话框 -->
  <div
    v-if="openConfirmDialogFlag"
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
    style="z-index: 10000"
  >
    <div
      class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto border border-border"
      @click.stop
      v-if="ThisConfirmModel"
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-4 border-b border-border"
      >
        <h3 class="text-lg font-semibold">
          {{ ThisConfirmModel.title }}
        </h3>
      </div>

      <!-- 内容区域 -->
      <div v-if="ThisConfirmModel?.content" class="p-4">
        <div
          class="text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed"
        >
          {{ ThisConfirmModel.content }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex justify-end gap-3 p-4 border-t border-border bg-surface-muted"
      >
        <!-- 关闭按钮 -->
        <button
          @click="close"
          class="px-4 py-2 bg-surface hover:bg-surface-muted text-foreground/80 rounded text-sm font-medium transition-colors border border-border"
        >
          {{ ThisConfirmModel.closeText || "关闭" }}
        </button>

        <!-- 取消按钮（仅在有 cancel 方法时显示）-->
        <button
          v-if="ThisConfirmModel.cancel"
          @click="cancel"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
        >
          {{ ThisConfirmModel.cancelText || "取消" }}
        </button>

        <!-- 确定按钮 -->
        <button
          @click="confirm"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors"
        >
          {{ ThisConfirmModel.confirmText || "确定" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
