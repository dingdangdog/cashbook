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
    class="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
    style="z-index: 10000"
  >
    <div
      class="bg-surface dark:bg-surface-dark rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto border border-frame dark:border-frame-dark"
      @click.stop
      v-if="ThisConfirmModel"
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-4 border-b border-frame-light dark:border-frame-dark"
      >
        <h3 class="text-lg font-semibold text-ink-primary dark:text-ink-onDark">
          {{ ThisConfirmModel.title }}
        </h3>
      </div>

      <!-- 内容区域 -->
      <div v-if="ThisConfirmModel?.content" class="p-4">
        <div
          class="text-sm text-ink-secondary dark:text-ink-onDark whitespace-pre-wrap break-words leading-relaxed"
        >
          {{ ThisConfirmModel.content }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex justify-end gap-3 p-4 border-t border-frame-light dark:border-frame-dark bg-surface-soft dark:bg-surface-darkMuted"
      >
        <!-- 关闭按钮 -->
        <button
          @click="close"
          class="px-4 py-2 bg-surface-muted hover:bg-surface-soft dark:bg-surface-darkMuted dark:hover:bg-surface-dark text-ink-secondary dark:text-ink-onDark rounded text-sm font-medium transition-colors"
        >
          {{ ThisConfirmModel.closeText || "关闭" }}
        </button>

        <!-- 取消按钮（仅在有 cancel 方法时显示）-->
        <button
          v-if="ThisConfirmModel.cancel"
          @click="cancel"
          class="px-4 py-2 bg-state-danger hover:bg-state-danger/90 text-white rounded text-sm font-medium transition-colors"
        >
          {{ ThisConfirmModel.cancelText || "取消" }}
        </button>

        <!-- 确定按钮 -->
        <button
          @click="confirm"
          class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded text-sm font-medium transition-colors"
        >
          {{ ThisConfirmModel.confirmText || "确定" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
