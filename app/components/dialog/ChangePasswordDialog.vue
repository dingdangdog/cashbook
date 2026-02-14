<template>
  <!-- 修改密码对话框 -->
  <div
    v-if="showChangePasswordDialog"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto border border-border"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-2 md:p-4 border-b border-border"
      >
        <h3 class="text-base md:text-lg font-semibold">修改密码</h3>
        <button
          @click="closeDialog"
          class="text-foreground/40 hover:text-foreground/70 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 表单内容 -->
      <div class="p-4 space-y-4">
        <UiTextInput
          v-model="changPasswordData.old"
          label="原密码"
          placeholder="请输入旧密码"
          autocomplete="current-password"
          required
          password
          :disabled="loading"
          :error="showErrors && !changPasswordData.old ? '原密码为必填项' : undefined"
        />

        <UiTextInput
          v-model="changPasswordData.new"
          label="新密码"
          placeholder="请输入新密码"
          required
          password
          :disabled="loading"
          :error="showErrors && !changPasswordData.new ? '新密码为必填项' : undefined"
        />

        <UiTextInput
          v-model="changPasswordData.againNew"
          label="重复新密码"
          placeholder="请再次输入新密码"
          required
          password
          :disabled="loading"
          :error="showErrors && !changPasswordData.againNew ? '重复新密码为必填项' : (showErrors && changPasswordData.new !== changPasswordData.againNew ? '两次密码不一致' : undefined)"
        />
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex flex-col sm:flex-row gap-3 p-4 border-t border-border bg-surface-muted"
      >
        <button
          @click="closeDialog"
          :disabled="loading"
          class="flex-1 px-4 py-2 text-foreground/80 border border-border rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          取消
        </button>
        <button
          @click="submitChange"
          :disabled="loading"
          class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-secondary-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <div
            v-if="loading"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></div>
          {{ loading ? "提交中..." : "确定" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showChangePasswordDialog } from "~/utils/flag";
import { ref } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

// ESC键监听
useEscapeKey(() => {
  if (showChangePasswordDialog.value) {
    showChangePasswordDialog.value = false;
  }
}, showChangePasswordDialog);

interface NewPassword {
  old?: string;
  new?: string;
  againNew?: string;
}

const loading = ref(false);
const showErrors = ref(false);

const changPasswordData = ref<NewPassword>({});

const submitChange = () => {
  if (loading.value) {
    return;
  }

  showErrors.value = true;

  // 验证必填项
  if (
    !changPasswordData.value.old ||
    !changPasswordData.value.new ||
    !changPasswordData.value.againNew
  ) {
    Alert.error("请填写完整信息");
    return;
  }

  // 验证密码一致性
  if (changPasswordData.value.new != changPasswordData.value.againNew) {
    Alert.error("两次密码不一致");
    return;
  }

  loading.value = true;
  doApi
    .post("api/entry/user/changePassword", changPasswordData.value)
    .then((res) => {
      if (res) {
        showChangePasswordDialog.value = false;
        Alert.success("密码修改成功！");
      } else {
        Alert.error("密码重置失败，请重试！");
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const closeDialog = () => {
  showChangePasswordDialog.value = false;
  changPasswordData.value = {};
  showErrors.value = false;
};
</script>

<style scoped></style>
