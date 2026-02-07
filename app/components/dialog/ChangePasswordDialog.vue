<template>
  <!-- 修改密码对话框 -->
  <div
    v-if="showChangePasswordDialog"
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
          修改密码
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
        <!-- 原密码 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
              class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-600"
              :class="{
                'border-red-500': !changPasswordData.old && showErrors,
              }"
            />
            <button
              type="button"
              @click="lookKey = !lookKey"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <EyeIcon v-if="!lookKey" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p
            v-if="!changPasswordData.old && showErrors"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            原密码为必填项
          </p>
        </div>

        <!-- 新密码 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            新密码
          </label>
          <div class="relative">
            <input
              v-model="changPasswordData.new"
              :type="lookKey ? 'text' : 'password'"
              :readonly="loading"
              placeholder="请输入新密码"
              class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-600"
              :class="{
                'border-red-500': !changPasswordData.new && showErrors,
              }"
            />
            <button
              type="button"
              @click="lookKey = !lookKey"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <EyeIcon v-if="!lookKey" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p
            v-if="!changPasswordData.new && showErrors"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            新密码为必填项
          </p>
        </div>

        <!-- 重复新密码 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            重复新密码
          </label>
          <div class="relative">
            <input
              v-model="changPasswordData.againNew"
              :type="lookKey ? 'text' : 'password'"
              :readonly="loading"
              placeholder="请再次输入新密码"
              class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-600"
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
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <EyeIcon v-if="!lookKey" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p
            v-if="!changPasswordData.againNew && showErrors"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            重复新密码为必填项
          </p>
          <p
            v-else-if="
              changPasswordData.new !== changPasswordData.againNew && showErrors
            "
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            两次密码不一致
          </p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex flex-col sm:flex-row gap-3 p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          @click="closeDialog"
          :disabled="loading"
          class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          取消
        </button>
        <button
          @click="submitChange"
          :disabled="loading"
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
