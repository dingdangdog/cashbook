<template>
  <Head>
    <Title>{{ SystemConfig?.title }} - 管理后台</Title>
  </Head>
  
  <div :class="[
    'min-h-screen flex flex-col items-center justify-center px-2 sm:px-4',
    'bg-gradient-to-br from-green-950 via-blue-900 to-green-950'
  ]">
    <!-- 右上角导航栏 -->
    <div class="fixed top-2 right-2 flex items-center gap-2 z-50">
      <!-- 返回前台按钮 -->
      <button
        @click="toHome()"
        class="p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg bg-gray-800/80 text-blue-400 hover:bg-gray-800"
        title="返回前台"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      </button>
      
      <button
        @click="toGithub()"
        class="p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg bg-gray-800/80 text-gray-300 hover:bg-gray-800"
        title="前往Github"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </button>
    </div>

    <!-- Logo 和标题 - 响应式调整 -->
    <div class="flex flex-col sm:flex-row items-center mb-4 sm:mb-6 text-center sm:text-left">
      <img src="/logo.png" class="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-2 sm:mb-0 sm:mr-4" />
      <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
        {{ SystemConfig?.title }} - 管理后台
      </h1>
    </div>

    <!-- 登录表单 - 响应式调整 -->
    <div class="w-full max-w-xs sm:max-w-sm md:max-w-md">
      <div class="rounded-xl shadow-xl p-4 sm:p-2 border bg-gray-800/90 border-gray-700 backdrop-blur-sm">
        <form @submit.prevent="onSubmit" class="space-y-4">
          <!-- 账号输入 -->
          <div>
            <label for="account" class="block text-sm font-medium mb-1 text-gray-300">
              管理员账号
            </label>
            <input
              id="account"
              v-model="loginParam.account"
              type="text"
              name="admin-account"
              autocomplete="admin-account"
              :disabled="loading"
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
                loginFormErrors.account 
                  ? 'border-red-500 bg-red-900/20'
                  : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400',
                loading ? 'opacity-60 cursor-not-allowed' : ''
              ]"
              placeholder="请输入管理员账号"
            />
            <p v-if="loginFormErrors.account" class="mt-1 text-sm text-red-400">
              {{ loginFormErrors.account }}
            </p>
          </div>

          <!-- 密码输入 -->
          <div>
            <label for="password" class="block text-sm font-medium mb-1 text-gray-300">
              管理员密码
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="loginParam.password"
                :type="lookPs ? 'text' : 'password'"
                name="admin-password"
                autocomplete="admin-password"
                :disabled="loading"
                :class="[
                  'w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
                  loginFormErrors.password 
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400',
                  loading ? 'opacity-60 cursor-not-allowed' : ''
                ]"
                placeholder="请输入管理员密码"
                @keyup.enter="onSubmit()"
              />
              <button
                type="button"
                @click="lookPs = !lookPs"
                :disabled="loading"
                class="absolute right-2 top-1/2 -translate-y-1/2 transition-colors text-gray-400 hover:text-gray-300 disabled:opacity-60"
              >
                <svg v-if="!lookPs" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
              </button>
            </div>
            <p v-if="loginFormErrors.password" class="mt-1 text-sm text-red-400">
              {{ loginFormErrors.password }}
            </p>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="!isFormValid || loading"
            :class="[
              'w-full font-medium py-2 sm:py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none relative',
              isFormValid && !loading 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            ]"
          >
            <span v-if="!loading">管理员登录</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AdminLogin } from "~/utils/model";

definePageMeta({
  // layout: "empty",
});

const loading = ref(false);
const lookPs = ref(false);
const loginParam = ref<AdminLogin>({ account: "", password: "" });

// 表单验证错误
const loginFormErrors = ref({
  account: '',
  password: ''
});

// 表单验证
const validateForm = () => {
  loginFormErrors.value = {
    account: '',
    password: ''
  };

  let isValid = true;

  if (!loginParam.value.account?.trim()) {
    loginFormErrors.value.account = '请输入管理员账号';
    isValid = false;
  }

  if (!loginParam.value.password?.trim()) {
    loginFormErrors.value.password = '请输入管理员密码';
    isValid = false;
  }

  return isValid;
};

// 计算属性：表单是否有效
const isFormValid = computed(() => {
  return loginParam.value.account?.trim() && loginParam.value.password?.trim();
});

const onSubmit = () => {
  if (!validateForm()) return;
  
  loading.value = true;
  return doApi
    .post("api/admin/login", loginParam.value)
    .then((res) => {
      Alert.success("后台登录成功");
      navigateTo({ path: "/admin/" });
    })
    .catch((e) => error(e.message))
    .finally(() => {
      loading.value = false;
    });
};

// 返回前台
const toHome = () => {
  navigateTo("/");
};

// 跳转到 GitHub
const toGithub = () => {
  window.open('https://github.com/dingdangdog/cashbook', '_blank');
};

// 如果已登录则跳转到管理后台
if (useCookie("Admin").value) {
  navigateTo("/admin/");
}
</script>
