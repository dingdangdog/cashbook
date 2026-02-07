<script setup lang="ts">
import { ref } from "vue";
import { showGetShareDialog } from "./flag";
import { XMarkIcon, KeyIcon } from "@heroicons/vue/24/outline";

// 组件传入数据
let { title } = defineProps(["title"]);
let emits = defineEmits(["success", "cancel"]);

const shareKey = ref("");
const isLoading = ref(false);
const error = ref("");

// 保存编辑数据
const save = () => {
  if (!shareKey.value || shareKey.value.trim() === "") {
    error.value = "请输入共享KEY";
    return;
  }

  error.value = "";
  isLoading.value = true;

  doApi
    .post("api/entry/book/inshare", { key: shareKey.value.trim() })
    .then((res) => {
      Alert.success("添加成功");
      showGetShareDialog.value = false;
      emits("success");
    })
    .catch((err) => {
      console.error(err);
      error.value = "添加失败，请检查共享KEY是否正确";
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const close = () => {
  showGetShareDialog.value = false;
  emits("cancel");
};

// 点击背景关闭
const closeOnBackdrop = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    close();
  }
};

// 清除错误消息
const clearError = () => {
  error.value = "";
};
</script>

<template>
  <!-- 对话框遮罩 -->
  <div
    v-if="showGetShareDialog"
    @click="closeOnBackdrop"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <!-- 对话框内容 -->
    <div
      class="bg-surface rounded-lg shadow-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-6 border-b border-border"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
            <KeyIcon class="h-6 w-6 text-accent-600 dark:text-accent-400" />
          </div>
          <h3 class="text-xl font-semibold text-foreground">
            添加共享账本
          </h3>
        </div>
        <button
          @click="close"
          class="text-muted hover:text-foreground transition-colors p-1 hover:bg-surface-muted rounded"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- 内容 -->
      <div class="p-6">
        <!-- 说明文本 -->
        <div
          class="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4
                class="text-sm font-medium text-primary-800 dark:text-primary-300 mb-1"
              >
                关于共享账本
              </h4>
              <p class="text-sm text-primary-700 dark:text-primary-400">
                使用他人分享的共享Key添加共享账本。添加后您可以查看和编辑该账本的数据。
              </p>
            </div>
          </div>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="save" class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-foreground mb-2"
            >
              共享Key <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <KeyIcon
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted"
              />
              <input
                v-model="shareKey"
                @input="clearError"
                type="text"
                placeholder="请输入共享Key"
                :class="[
                  'w-full pl-10 pr-4 py-3 border rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500',
                  'bg-surface text-foreground',
                  'placeholder-muted',
                  error
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-border',
                ]"
              />
            </div>
            <p
              v-if="error"
              class="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ error }}
            </p>
          </div>
        </form>

        <!-- 帮助信息 -->
        <div class="mt-6 p-3 bg-surface-muted rounded-lg">
          <h5 class="text-sm font-medium text-foreground mb-2">
            如何获取共享Key？
          </h5>
          <ul class="text-sm text-muted space-y-1">
            <li class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-muted rounded-full"></div>
              其他用户在账本管理页面点击"分享"按钮
            </li>
            <li class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-muted rounded-full"></div>
              系统会生成唯一的共享Key
            </li>
            <li class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-muted rounded-full"></div>
              将该Key发送给您即可添加
            </li>
          </ul>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex items-center justify-end gap-3 p-6 border-t border-border bg-surface-muted"
      >
        <button
          @click="close"
          type="button"
          class="px-4 py-2 text-sm font-medium text-foreground bg-surface border border-border rounded-lg hover:bg-surface-muted transition-colors"
        >
          取消
        </button>
        <button
          @click="save"
          :disabled="isLoading || !shareKey.trim()"
          :class="[
            'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2',
            isLoading || !shareKey.trim()
              ? 'bg-muted cursor-not-allowed'
              : 'bg-accent-600 hover:bg-accent-500 active:bg-accent-700',
          ]"
        >
          <span v-if="isLoading" class="flex items-center">
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            ></div>
            添加中...
          </span>
          <span v-else>确定添加</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 确保对话框在移动端的良好显示 */
@media (max-width: 640px) {
  .fixed {
    padding: 1rem;
  }
}
</style>
