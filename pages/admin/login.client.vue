<template>
  <Head>
    <Title>{{ SystemConfig?.title }} - 管理后台</Title>
  </Head>
  
  <div :class="[
    'tw-min-h-screen tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-2 sm:tw-px-4',
    'tw-bg-gradient-to-br tw-from-gray-900 tw-via-blue-900 tw-to-gray-900'
  ]">
    <!-- 右上角导航栏 -->
    <div class="tw-fixed tw-top-2 tw-right-2 tw-flex tw-items-center tw-gap-2 tw-z-50">
      <!-- 返回前台按钮 -->
      <button
        @click="toHome()"
        class="tw-p-2 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-md tw-hover:tw-shadow-lg tw-bg-gray-800/80 tw-text-blue-400 tw-hover:tw-bg-gray-800"
        title="返回前台"
      >
        <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      </button>
      
      <button
        @click="toGithub()"
        class="tw-p-2 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-md tw-hover:tw-shadow-lg tw-bg-gray-800/80 tw-text-gray-300 tw-hover:tw-bg-gray-800"
        title="前往Github"
      >
        <svg class="tw-w-5 tw-h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </button>
    </div>

    <!-- Logo 和标题 - 响应式调整 -->
    <div class="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-mb-4 sm:tw-mb-6 tw-text-center sm:tw-text-left">
      <img src="/logo.png" class="tw-w-12 tw-h-12 sm:tw-w-16 sm:tw-h-16 tw-object-contain tw-mb-2 sm:tw-mb-0 sm:tw-mr-4" />
      <h1 class="tw-text-xl sm:tw-text-2xl lg:tw-text-3xl tw-font-bold tw-text-white">
        {{ SystemConfig?.title }} - 管理后台
      </h1>
    </div>

    <!-- 登录表单 - 响应式调整 -->
    <div class="tw-w-full tw-max-w-xs sm:tw-max-w-sm md:tw-max-w-md">
      <div class="tw-rounded-xl tw-shadow-xl tw-p-4 sm:tw-p-6 tw-border tw-bg-gray-800/90 tw-border-gray-700 tw-backdrop-blur-sm">
        <form @submit.prevent="onSubmit" class="tw-space-y-4">
          <!-- 账号输入 -->
          <div>
            <label for="account" class="tw-block tw-text-sm tw-font-medium tw-mb-1 tw-text-gray-300">
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
                'tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-lg tw-focus:tw-ring-2 tw-focus:tw-ring-blue-500 tw-focus:tw-border-blue-500 tw-transition-colors tw-duration-200',
                loginFormErrors.account 
                  ? 'tw-border-red-500 tw-bg-red-900/20'
                  : 'tw-border-gray-600 tw-bg-gray-700 tw-text-white tw-placeholder-gray-400',
                loading ? 'tw-opacity-60 tw-cursor-not-allowed' : ''
              ]"
              placeholder="请输入管理员账号"
            />
            <p v-if="loginFormErrors.account" class="tw-mt-1 tw-text-sm tw-text-red-400">
              {{ loginFormErrors.account }}
            </p>
          </div>

          <!-- 密码输入 -->
          <div>
            <label for="password" class="tw-block tw-text-sm tw-font-medium tw-mb-1 tw-text-gray-300">
              管理员密码
            </label>
            <div class="tw-relative">
              <input
                id="password"
                v-model="loginParam.password"
                :type="lookPs ? 'text' : 'password'"
                name="admin-password"
                autocomplete="admin-password"
                :disabled="loading"
                :class="[
                  'tw-w-full tw-px-3 tw-py-2 tw-pr-10 tw-border tw-rounded-lg tw-focus:tw-ring-2 tw-focus:tw-ring-blue-500 tw-focus:tw-border-blue-500 tw-transition-colors tw-duration-200',
                  loginFormErrors.password 
                    ? 'tw-border-red-500 tw-bg-red-900/20'
                    : 'tw-border-gray-600 tw-bg-gray-700 tw-text-white tw-placeholder-gray-400',
                  loading ? 'tw-opacity-60 tw-cursor-not-allowed' : ''
                ]"
                placeholder="请输入管理员密码"
                @keyup.enter="onSubmit()"
              />
              <button
                type="button"
                @click="lookPs = !lookPs"
                :disabled="loading"
                class="tw-absolute tw-right-2 tw-top-1/2 tw--tw-translate-y-1/2 tw-transition-colors tw-text-gray-400 tw-hover:tw-text-gray-300 disabled:tw-opacity-60"
              >
                <svg v-if="!lookPs" class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg v-else class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
              </button>
            </div>
            <p v-if="loginFormErrors.password" class="tw-mt-1 tw-text-sm tw-text-red-400">
              {{ loginFormErrors.password }}
            </p>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="!isFormValid || loading"
            :class="[
              'tw-w-full tw-font-medium tw-py-2 sm:tw-py-3 tw-px-4 tw-rounded-lg tw-transition-all tw-duration-200 tw-focus:tw-ring-2 tw-focus:tw-ring-blue-500 tw-focus:tw-ring-offset-2 tw-focus:tw-outline-none tw-relative',
              isFormValid && !loading 
                ? 'tw-bg-blue-600 tw-hover:tw-bg-blue-700 tw-text-white tw-shadow-md tw-hover:tw-shadow-lg' 
                : 'tw-bg-gray-600 tw-text-gray-400 tw-cursor-not-allowed'
            ]"
          >
            <span v-if="!loading">管理员登录</span>
            <span v-else class="tw-flex tw-items-center tw-justify-center">
              <svg class="tw-animate-spin tw-h-4 tw-w-4 tw-mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
