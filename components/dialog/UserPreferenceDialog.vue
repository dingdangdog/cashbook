<template>
  <div
    v-if="showUserPreferenceDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto"
      @click.stop
    >
      <!-- Title bar -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          个人偏好
        </h3>
        <button
          @click="closeDialog"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <div class="p-4 space-y-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            默认流水类型
          </label>
          <select
            v-model="selectedFlowType"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option v-for="t in flowTypeOptions" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
        </div>
      </div>

      <!-- Actions -->
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
          @click="savePreference"
          :disabled="loading"
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <div
            v-if="loading"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></div>
          {{ loading ? "保存中..." : "保存" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showUserPreferenceDialog } from "~/utils/flag";
import { GlobalUserInfo } from "~/utils/store";
import { ref } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

useEscapeKey(() => {
  if (showUserPreferenceDialog.value) {
    closeDialog();
  }
}, showUserPreferenceDialog);

const flowTypeOptions = ["支出", "收入", "不计收支"];
const selectedFlowType = ref(
  GlobalUserInfo.value?.defaultFlowType || "支出"
);
const loading = ref(false);

const savePreference = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await doApi.post("api/entry/user/updatePreference", {
      defaultFlowType: selectedFlowType.value,
    });
    if (res) {
      if (GlobalUserInfo.value) {
        GlobalUserInfo.value.defaultFlowType = selectedFlowType.value;
      }
      Alert.success("偏好保存成功！");
      showUserPreferenceDialog.value = false;
    } else {
      Alert.error("保存失败，请重试！");
    }
  } catch {
    Alert.error("保存失败，请重试！");
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  showUserPreferenceDialog.value = false;
};
</script>
