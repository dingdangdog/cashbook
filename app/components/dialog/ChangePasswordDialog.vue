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
        class="flex items-center justify-between p-4 border-b border-border"
      >
        <h3 class="text-lg font-semibold">修改密码</h3>
        <button
          @click="closeDialog"
          class="text-foreground/40 hover:text-foreground/70 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 表单内容 -->
      <div class="p-4 space-y-4">
        <!-- 原密码 -->
        <div>
          <label
            class="block text-sm font-medium text-foreground/80 mb-1"
          >
            原密码
          </label>
          <div class="relative">
            <input
              v-model="changPasswordData.old"
              :type="lookKey ? 'text' : 'password'"
              :readonly="loading"
              placeholder="请输入旧密码"
              autocomplete="current-password"
              class="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground placeholder-foreground/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-70"
              :class="{
                'border-red-500': !changPasswordData.old && showErrors,
              }"
            />
            <button
              type="button"
              @click="lookKey = !lookKey"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-foreground/70"
            >
              <EyeIcon v-if="!lookKey" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p
            v-if="!changPasswordData.old && showErrors"
            class="mt-1 text-sm text-red-500"
          >
            原密码为必填项
          </p>
        </div>

        <!-- 新密码 -->
        <div>
          <label
            class="block text-sm font-medium text-foreground/80 mb-1"
          >
            新密码
          </label>
          <div class="relative">
            <input
              v-model="changPasswordData.new"
              :type="lookKey ? 'text' : 'password'"
              :readonly="loading"
              placeholder="请输入新密码"
              class="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground placeholder-foreground/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-70"
              :class="{
                'border-red-500': !changPasswordData.new && showErrors,
              }"
            />
            <button
              type="button"
              @click="lookKey = !lookKey"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-foreground/70"
            >
              <EyeIcon v-if="!lookKey" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p
            v-if="!changPasswordData.new && showErrors"
            class="mt-1 text-sm text-red-500"
          >
            新密码为必填项
          </p>
        </div>

        <!-- 重复新密码 -->
        <div>
          <label
            class="block text-sm font-medium text-foreground/80 mb-1"
          >
            重复新密码
          </label>
          <div class="relative">
            <input
              v-model="changPasswordData.againNew"
              :type="lookKey ? 'text' : 'password'"
              :readonly="loading"
              placeholder="请再次输入新密码"
              class="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground placeholder-foreground/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-70"
              :class="{
                'border-red-500':
                  (!changPasswordData.againNew ||
                    changPasswordData.new !== changPasswordData.againNew) &&
                  showErrors,
              }"
            />
            <button
              type="button"
              @click="lookKey = !lookKey"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-foreground/70"
            >
              <EyeIcon v-if="!lookKey" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p
            v-if="!changPasswordData.againNew && showErrors"
            class="mt-1 text-sm text-red-500"
          >
            重复新密码为必填项
          </p>
          <p
            v-else-if="
              changPasswordData.new !== changPasswordData.againNew && showErrors
            "
            class="mt-1 text-sm text-red-500"
          >
            两次密码不一致
          </p>
        </div>
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
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";

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
const lookKey = ref(false);
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
  // 重置表单状态
  changPasswordData.value = {};
  showErrors.value = false;
  lookKey.value = false;
};
</script>

<style scoped></style>
