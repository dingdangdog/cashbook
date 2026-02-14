<script setup lang="ts">
import { ref, watch } from "vue";
import { changePassword } from "./api";

const props = defineProps<{ visible: boolean; user: User | null }>();
const emit = defineEmits(["success", "cancel"]);

const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");
const loading = ref(false);

watch(
  () => props.visible,
  (v) => {
    if (!v) {
      newPassword.value = "";
      confirmPassword.value = "";
      error.value = "";
    }
  }
);

const save = () => {
  error.value = "";
  if (!newPassword.value.trim()) {
    error.value = "请输入新密码";
    return;
  }
  if (newPassword.value.length < 8) {
    error.value = "密码至少 8 个字符";
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = "两次密码不一致";
    return;
  }
  if (!props.user?.id) return;
  loading.value = true;
  changePassword(props.user.id, newPassword.value)
    .then(() => {
      Alert.success("密码已更新");
      emit("success");
    })
    .catch((err: Error) => {
      error.value = err.message || "修改失败";
    })
    .finally(() => (loading.value = false));
};

const close = () => emit("cancel");
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="close"
  >
    <div
      class="bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-700"
      @click.stop
    >
      <div class="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-white">修改密码 · {{ user?.name || user?.username }}</h3>
        <button type="button" @click="close" class="text-gray-400 hover:text-gray-300">×</button>
      </div>
      <div class="px-6 py-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">新密码 <span class="text-red-400">*</span></label>
          <input
            v-model="newPassword"
            type="password"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="至少 8 个字符"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">确认新密码 <span class="text-red-400">*</span></label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="再次输入"
          />
        </div>
        <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
      </div>
      <div class="px-6 py-4 border-t border-gray-700 flex justify-end gap-2">
        <button type="button" @click="close" :disabled="loading" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg">取消</button>
        <button type="button" @click="save" :disabled="loading" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">确定</button>
      </div>
    </div>
  </div>
</template>
