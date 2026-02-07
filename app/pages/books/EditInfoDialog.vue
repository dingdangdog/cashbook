<script setup lang="ts">
import { ref } from "vue";
import { add, update } from "./api";
import { editInfoFlag } from "./flag";
import { XMarkIcon } from "@heroicons/vue/24/outline";

// 组件传入数据
let { item, title } = defineProps(["item", "title"]);
let emits = defineEmits(["success", "cancel"]);

// 编辑数据实体
const editItem = ref<Book | any>();
const formErrors = ref<Record<string, string>>({});

if (item) {
  editItem.value = { ...item };
} else {
  editItem.value = {};
}

const isSaving = ref(false);

// 验证表单
const validateForm = () => {
  formErrors.value = {};

  if (!editItem.value?.bookName || editItem.value.bookName.trim() === "") {
    formErrors.value.bookName = "账本名称不能为空";
  }

  if (editItem.value?.budget && isNaN(Number(editItem.value.budget))) {
    formErrors.value.budget = "预算必须是数字";
  }

  return Object.keys(formErrors.value).length === 0;
};

// 保存编辑数据
const save = () => {
  if (!validateForm() || isSaving.value) {
    if (!validateForm()) {
      Alert.error("请检查表单输入！");
    }
    return;
  }

  isSaving.value = true;

  if (editItem.value?.id) {
    update(editItem.value)
      .then((_res) => {
        Alert.success("保存成功");
        editInfoFlag.value = false;
        emits("success");
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        isSaving.value = false;
      });
  } else {
    if (editItem.value) {
      add(editItem.value)
        .then((_res) => {
          Alert.success("保存成功");
          editInfoFlag.value = false;
          emits("success");
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          isSaving.value = false;
        });
    } else {
      isSaving.value = false;
    }
  }
};

const close = () => {
  editInfoFlag.value = false;
  emits("cancel");
};

// 点击背景关闭
const closeOnBackdrop = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    close();
  }
};
</script>

<template>
  <!-- 对话框遮罩 -->
  <div
    v-if="editInfoFlag"
    @click="closeOnBackdrop"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
  >
    <!-- 对话框内容 -->
    <div
      class="bg-surface rounded-lg shadow-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-2 border-b border-border"
      >
        <h3 class="text-xl font-semibold text-foreground">
          {{ title }}
        </h3>
        <button
          @click="close"
          class="text-muted hover:text-foreground transition-colors p-1 hover:bg-surface-muted rounded"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- 表单内容 -->
      <div class="p-6">
        <form @submit.prevent="save" class="space-y-4">
          <!-- 账本名称 -->
          <div>
            <label
              class="block text-sm font-medium text-foreground mb-2"
            >
              账本名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editItem.bookName"
              type="text"
              placeholder="请输入账本名称"
              :class="[
                'w-full px-3 py-2 border rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                'bg-surface text-foreground',
                'placeholder-muted',
                formErrors.bookName
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-border',
              ]"
            />
            <p
              v-if="formErrors.bookName"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ formErrors.bookName }}
            </p>
          </div>

          <!-- 预算 -->
          <div>
            <label
              class="block text-sm font-medium text-foreground mb-2"
            >
              预算（每月）
            </label>
            <input
              v-model="editItem.budget"
              type="number"
              step="0.01"
              placeholder="请输入月预算金额"
              :class="[
                'w-full px-3 py-2 border rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'bg-surface text-foreground',
                'placeholder-muted',
                formErrors.budget
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-border',
              ]"
            />
            <p
              v-if="formErrors.budget"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ formErrors.budget }}
            </p>
            <p class="mt-1 text-xs text-muted">
              可选项，用于预算管理功能
            </p>
          </div>
        </form>
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
          :disabled="isSaving"
          :class="[
            'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            isSaving
              ? 'bg-muted cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-500 active:bg-primary-700',
          ]"
        >
          <span v-if="isSaving" class="flex items-center">
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            ></div>
            保存中...
          </span>
          <span v-else>保存</span>
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
