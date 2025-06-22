<script setup lang="ts">
import { ref } from "vue";
import { add, update } from "./api";
import { editInfoFlag } from "./flag";

// 组件传入数据
let { item, title } = defineProps(["item", "title"]);
let emits = defineEmits(["success", "cancel"]);
// 编辑数据实体
const editItem = ref<User | any>();

if (item) {
  editItem.value = { ...item };
} else {
  editItem.value = {};
}

const errors = ref({
  username: '',
  password: '',
  name: '',
  email: ''
});

const validateForm = () => {
  errors.value = {
    username: '',
    password: '',
    name: '',
    email: ''
  };

  let isValid = true;

  if (!editItem.value.username?.trim()) {
    errors.value.username = '账号不能为空';
    isValid = false;
  } else if (editItem.value.username.length < 4) {
    errors.value.username = '账号必须大于等于4个字符';
    isValid = false;
  }

  if (!editItem.value.password?.trim()) {
    errors.value.password = '密码不能为空';
    isValid = false;
  } else if (editItem.value.password.length < 8) {
    errors.value.password = '密码必须大于等于8个字符';
    isValid = false;
  }

  return isValid;
};

const loading = ref(false);

// 保存编辑数据
const save = () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  if (editItem.value?.id) {
    update(editItem.value).then((res) => {
      Alert.success("修改成功");
      editInfoFlag.value = false;
      emits("success");
    }).catch((err) => {
      Alert.error("修改失败: " + err.message);
    }).finally(() => {
      loading.value = false;
    });
  } else {
    if (editItem.value) {
      add(editItem.value).then((res) => {
        Alert.success("添加成功");
        editInfoFlag.value = false;
        emits("success");
      }).catch((err) => {
        Alert.error("添加失败: " + err.message);
      }).finally(() => {
        loading.value = false;
      });
    }
  }
};

const close = () => {
  editInfoFlag.value = false;
  emits("cancel");
};
</script>

<template>
  <!-- 遮罩层 -->
  <div
    v-if="editInfoFlag"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="close"
  >
    <!-- 对话框 -->
    <div
      class="bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-700 transform transition-all"
      @click.stop
    >
      <!-- 标题栏 -->
      <div class="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
        <button
          @click="close"
          class="text-gray-400 hover:text-gray-300 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 表单内容 -->
      <div class="px-6 py-4 space-y-4">
        <!-- 昵称 -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            昵称
          </label>
          <input
            v-model="editItem.name"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="请输入昵称"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-400">{{ errors.name }}</p>
        </div>

        <!-- 账号 -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            账号 <span class="text-red-400">*</span>
          </label>
          <input
            v-model="editItem.username"
            type="text"
            required
            :class="[
              'w-full px-3 py-2 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors',
              errors.username 
                ? 'bg-red-900/20 border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            ]"
            placeholder="请输入账号"
          />
          <p v-if="errors.username" class="mt-1 text-sm text-red-400">{{ errors.username }}</p>
        </div>

        <!-- 密码 -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            密码 <span class="text-red-400">*</span>
          </label>
          <input
            v-model="editItem.password"
            type="password"
            required
            :class="[
              'w-full px-3 py-2 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors',
              errors.password 
                ? 'bg-red-900/20 border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            ]"
            placeholder="请输入密码"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-400">{{ errors.password }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            v-model="editItem.email"
            type="email"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="请输入邮箱地址"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-400">{{ errors.email }}</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="px-6 py-4 border-t border-gray-700 flex justify-end space-x-3">
        <button
          @click="close"
          :disabled="loading"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          @click="save"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? '保存中...' : '保存' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
