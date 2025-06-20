<script setup lang="ts">
definePageMeta({
  unauthenticatedOnly: true,
});

import { BookOpenIcon, EyeIcon, EyeSlashIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/outline';
import { useTheme } from "vuetify";
import { SystemConfig } from "~/utils/store";
import { checkSignIn } from "~/utils/common";

const theme = useTheme();
const isDark = ref(false);

const toggleTheme = () => {
  // 切换 Vuetify 主题
  const to = theme.global.name.value == "light" ? "dark" : "light";
  theme.global.name.value = to;
  localStorage.setItem("theme", to);
  
  // 同时切换 HTML class 以支持 Tailwind dark 模式
  isDark.value = to === 'dark';
  
  // 确保在下一个 tick 更新 DOM
  nextTick(() => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    console.log('Theme toggled to:', to, 'isDark:', isDark.value, 'HTML has dark class:', document.documentElement.classList.contains('dark'));
  });
};

const usernameRules = [
  (v: string) => !!v || "必填",
  (v: string) => (v && v.length >= 4) || "账号必须大于等于4个字符",
];
const passwordRules = [
  (v: string) => !!v || "必填",
  (v: string) => (v && v.length >= 8) || "密码必须大于等于8个字符",
];
const againPasswordRules = [
  (v: string) => !!v || "必填",
  (v: string) => v == registerParam.value.password || "密码不一致",
];

const openRegister = ref(false);
const registerDialog = ref(false);

if (SystemConfig.value) {
  openRegister.value = SystemConfig.value.openRegister;
}

const loginParam = ref<any>({
  username: "",
  password: "",
});

const loginFormErrors = ref<{ [key: string]: string }>({});
const validateLoginForm = () => {
  loginFormErrors.value = {};
  
  if (!loginParam.value.username) {
    loginFormErrors.value.username = "必填";
  } else if (loginParam.value.username.length < 4) {
    loginFormErrors.value.username = "账号必须大于等于4个字符";
  }
  
  if (!loginParam.value.password) {
    loginFormErrors.value.password = "必填";
  } else if (loginParam.value.password.length < 8) {
    loginFormErrors.value.password = "密码必须大于等于8个字符";
  }
  
  return Object.keys(loginFormErrors.value).length === 0;
};

const login = async () => {
  if (validateLoginForm()) {
    doApi.post("api/login", loginParam.value).then((res) => {
      Alert.success("登录成功");
      navigateTo(fromUrl.value || "/");
    });
  }
};

const registerParam = ref({
  name: "",
  username: "",
  password: "",
  againPassword: "",
});

const registerFormErrors = ref<{ [key: string]: string }>({});
const validateRegisterForm = () => {
  registerFormErrors.value = {};
  
  if (!registerParam.value.username) {
    registerFormErrors.value.username = "必填";
  } else if (registerParam.value.username.length < 4) {
    registerFormErrors.value.username = "账号必须大于等于4个字符";
  }
  
  if (!registerParam.value.password) {
    registerFormErrors.value.password = "必填";
  } else if (registerParam.value.password.length < 8) {
    registerFormErrors.value.password = "密码必须大于等于8个字符";
  }
  
  if (!registerParam.value.againPassword) {
    registerFormErrors.value.againPassword = "必填";
  } else if (registerParam.value.againPassword !== registerParam.value.password) {
    registerFormErrors.value.againPassword = "密码不一致";
  }
  
  return Object.keys(registerFormErrors.value).length === 0;
};

const register = async () => {
  if (validateRegisterForm()) {
    doApi.post<UserInfo>("api/register", registerParam.value).then((res) => {
      Alert.success("注册成功，请登录");
      loginParam.value.username = registerParam.value.username;
      loginParam.value.password = registerParam.value.password;
      registerDialog.value = false;
    });
  }
};

const lookLoginPS = ref(false);
const lookRegisterPS = ref(false);
const lookRegisterAPS = ref(false);

const fromUrl = ref();
onMounted(async () => {
  const route = useRoute();
  const loginUrl = route.path;
  const callbackUrl = route.query.callbackUrl;
  if (loginUrl != callbackUrl) {
    fromUrl.value = callbackUrl;
  }

  const nowTheme = localStorage.getItem("theme");
  if (nowTheme) {
    theme.global.name.value = nowTheme;
    isDark.value = nowTheme === 'dark';
  } else {
    // 如果没有保存的主题，使用当前 Vuetify 主题
    isDark.value = theme.global.name.value === 'dark';
  }
  
  // 确保正确设置暗黑模式 class
  nextTick(() => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    console.log('Initial theme:', theme.global.name.value, 'isDark:', isDark.value, 'HTML has dark class:', document.documentElement.classList.contains('dark'));
  });

  // 校验登录
  if (checkSignIn()) {
    Alert.success("登录成功");
    setTimeout(() => {
      if (fromUrl.value) {
        window.location.href = fromUrl.value;
      } else {
        navigateTo("/");
      }
    }, 200);
  }

  doApi.get("api/check").then((res) => {
    console.log("res", res);
    if (!res) {
      Confirm.open({
        title: "提示",
        content: '当前系统没有普通用户，请前往【后台】"添加用户"或"开放注册"！',
        confirmText: "前往后台",
        cancelText: "知道了",
        confirm: () => {
          navigateTo("/admin");
        },
      });
    }
  });
});

const toDocumentation = () => {
  window.open('https://docs.example.com', '_blank');
};

const toGithub = () => {
  window.open('https://github.com/dingdangdog/cashbook', '_blank');
};

const toAdmin = () => {
  navigateTo("/admin");
};
</script>

<template>
  <Head>
    <Title>{{ SystemConfig?.title }}</Title>
    <Meta name="description" :content="SystemConfig?.description" />
    <Meta
      name="keywords"
      :content="`Cashbook,记账本,私人记账,开源账本,dingdangdog,月上老狗,${SystemConfig?.keywords}`"
    />
  </Head>

  <div :class="[
    'tw-min-h-screen tw-transition-colors tw-duration-300',
    isDark ? 'tw-bg-gradient-to-br tw-from-gray-900 tw-to-gray-800' : 'tw-bg-gradient-to-br tw-from-green-50 tw-to-emerald-100'
  ]">
    <!-- 右上角导航栏 -->
    <div class="tw-fixed tw-top-2 tw-right-2 tw-flex tw-items-center tw-gap-2 tw-z-50">
      <!-- 主题切换按钮 - 移到最左侧 -->
      <button
        @click="toggleTheme()"
        :class="[
          'tw-p-2 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-md tw-hover:tw-shadow-lg',
          isDark ? 'tw-bg-gray-800/80 tw-text-green-400 tw-hover:tw-bg-gray-800' : 'tw-bg-white/80 tw-text-green-600 tw-hover:tw-bg-white'
        ]"
        title="切换主题"
      >
        <SunIcon v-if="isDark" class="tw-w-5 tw-h-5" />
        <MoonIcon v-else class="tw-w-5 tw-h-5" />
      </button>
      
      <button
        @click="toDocumentation()"
        :class="[
          'tw-p-2 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-md tw-hover:tw-shadow-lg',
          isDark ? 'tw-bg-gray-800/80 tw-text-gray-300 tw-hover:tw-bg-gray-800' : 'tw-bg-white/80 tw-text-gray-600 tw-hover:tw-bg-white'
        ]"
        title="文档站"
      >
        <BookOpenIcon class="tw-w-5 tw-h-5" />
      </button>
      
      <button
        @click="toGithub()"
        :class="[
          'tw-p-2 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-md tw-hover:tw-shadow-lg',
          isDark ? 'tw-bg-gray-800/80 tw-text-gray-300 tw-hover:tw-bg-gray-800' : 'tw-bg-white/80 tw-text-gray-600 tw-hover:tw-bg-white'
        ]"
        title="前往Github"
      >
        <svg class="tw-w-5 tw-h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </button>
      
      <!-- Admin入口按钮 -->
      <button
        @click="toAdmin()"
        :class="[
          'tw-p-2 tw-rounded-lg tw-transition-all tw-duration-200 tw-shadow-md tw-hover:tw-shadow-lg',
          isDark ? 'tw-bg-gray-800/80 tw-text-orange-400 tw-hover:tw-bg-gray-800' : 'tw-bg-white/80 tw-text-orange-600 tw-hover:tw-bg-white'
        ]"
        title="管理后台"
      >
        <svg class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </button>
    </div>

    <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-min-h-screen tw-px-2 sm:tw-px-4">
      <!-- Logo 和标题 - 响应式调整 -->
      <div class="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-mb-4 sm:tw-mb-6 tw-text-center sm:tw-text-left">
        <img src="/logo.png" class="tw-w-12 tw-h-12 sm:tw-w-16 sm:tw-h-16 tw-object-contain tw-mb-2 sm:tw-mb-0 sm:tw-mr-4" />
        <h1 :class="['tw-text-xl sm:tw-text-2xl lg:tw-text-3xl tw-font-bold', isDark ? 'tw-text-white' : 'tw-text-gray-800']">
          欢迎使用{{ SystemConfig?.title }}
        </h1>
      </div>

      <!-- 登录表单 - 响应式调整 -->
      <div class="tw-w-full tw-max-w-xs sm:tw-max-w-sm md:tw-max-w-md">
        <div :class="[
          'tw-rounded-xl tw-shadow-xl tw-p-4 sm:tw-p-6 tw-border',
          isDark ? 'tw-bg-gray-800 tw-border-gray-700' : 'tw-bg-white tw-border-gray-200'
        ]">
          <form @submit.prevent="login" class="tw-space-y-4">
            <!-- 用户名输入 -->
            <div>
              <label for="username" :class="['tw-block tw-text-sm tw-font-medium tw-mb-1', isDark ? 'tw-text-gray-300' : 'tw-text-gray-700']">
                账号
              </label>
              <input
                id="username"
                v-model="loginParam.username"
                type="text"
                name="username"
                autocomplete="username"
                :class="[
                  'tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-lg tw-focus:tw-ring-2 tw-focus:tw-ring-green-500 tw-focus:tw-border-green-500 tw-transition-colors tw-duration-200',
                  loginFormErrors.username 
                    ? (isDark ? 'tw-border-red-500 tw-bg-red-900/20' : 'tw-border-red-500 tw-bg-red-50')
                    : (isDark ? 'tw-border-gray-600 tw-bg-gray-700 tw-text-white tw-placeholder-gray-400' : 'tw-border-gray-300 tw-bg-white tw-text-gray-900 tw-placeholder-gray-500')
                ]"
                placeholder="请输入账号"
              />
              <p v-if="loginFormErrors.username" :class="['tw-mt-1 tw-text-sm', isDark ? 'tw-text-red-400' : 'tw-text-red-600']">
                {{ loginFormErrors.username }}
              </p>
            </div>

            <!-- 密码输入 -->
            <div>
              <label for="password" :class="['tw-block tw-text-sm tw-font-medium tw-mb-1', isDark ? 'tw-text-gray-300' : 'tw-text-gray-700']">
                密码
              </label>
              <div class="tw-relative">
                <input
                  id="password"
                  v-model="loginParam.password"
                  :type="lookLoginPS ? 'text' : 'password'"
                  name="password"
                  autocomplete="current-password"
                  :class="[
                    'tw-w-full tw-px-3 tw-py-2 tw-pr-10 tw-border tw-rounded-lg tw-focus:tw-ring-2 tw-focus:tw-ring-green-500 tw-focus:tw-border-green-500 tw-transition-colors tw-duration-200',
                    loginFormErrors.password 
                      ? (isDark ? 'tw-border-red-500 tw-bg-red-900/20' : 'tw-border-red-500 tw-bg-red-50')
                      : (isDark ? 'tw-border-gray-600 tw-bg-gray-700 tw-text-white tw-placeholder-gray-400' : 'tw-border-gray-300 tw-bg-white tw-text-gray-900 tw-placeholder-gray-500')
                  ]"
                  placeholder="请输入密码"
                  @keyup.enter="login()"
                />
                <button
                  type="button"
                  @click="lookLoginPS = !lookLoginPS"
                  :class="['tw-absolute tw-right-2 tw-top-1/2 tw--tw-translate-y-1/2 tw-transition-colors', isDark ? 'tw-text-gray-400 tw-hover:tw-text-gray-300' : 'tw-text-gray-400 tw-hover:tw-text-gray-600']"
                >
                  <EyeIcon v-if="!lookLoginPS" class="tw-w-4 tw-h-4" />
                  <EyeSlashIcon v-else class="tw-w-4 tw-h-4" />
                </button>
              </div>
              <p v-if="loginFormErrors.password" :class="['tw-mt-1 tw-text-sm', isDark ? 'tw-text-red-400' : 'tw-text-red-600']">
                {{ loginFormErrors.password }}
              </p>
            </div>

            <!-- 登录按钮 -->
            <button
              type="submit"
              class="tw-w-full tw-bg-green-600 tw-hover:tw-bg-green-700 tw-text-white tw-font-medium tw-py-2 sm:tw-py-3 tw-px-4 tw-rounded-lg tw-transition-colors tw-duration-200 tw-focus:tw-ring-2 tw-focus:tw-ring-green-500 tw-focus:tw-ring-offset-2 tw-focus:tw-outline-none"
            >
              登录
            </button>

            <!-- 注册按钮 -->
            <div v-if="openRegister" class="tw-text-center tw-pt-2">
              <button
                type="button"
                @click="registerDialog = true"
                :class="['tw-font-medium tw-transition-colors tw-duration-200', isDark ? 'tw-text-green-400 tw-hover:tw-text-green-300' : 'tw-text-green-600 tw-hover:tw-text-green-700']"
              >
                注册账号
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 注册对话框 -->
    <div v-if="registerDialog" class="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4">
      <div :class="['tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-md tw-max-h-[90vh] tw-overflow-y-auto', isDark ? 'tw-bg-gray-800' : 'tw-bg-white']">
        <div class="tw-p-6">
          <div class="tw-flex tw-justify-between tw-items-center tw-mb-6">
            <h3 :class="['tw-text-xl tw-font-semibold', isDark ? 'tw-text-white' : 'tw-text-gray-900']">注册用户</h3>
            <button
              @click="registerDialog = false"
              :class="['tw-transition-colors', isDark ? 'tw-text-gray-400 tw-hover:tw-text-gray-300' : 'tw-text-gray-400 tw-hover:tw-text-gray-600']"
            >
              <svg class="tw-w-6 tw-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="register" class="tw-space-y-4">
            <!-- 昵称 -->
            <div>
              <label for="name" class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300 tw-mb-2">
                昵称
              </label>
              <input
                id="name"
                v-model="registerParam.name"
                type="text"
                name="name"
                class="tw-w-full tw-px-4 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-lg tw-focus:tw-ring-2 tw-focus:tw-ring-green-500 tw-focus:tw-border-green-500 tw-bg-white dark:tw-bg-gray-700 tw-text-gray-900 dark:tw-text-white tw-placeholder-gray-500 dark:tw-placeholder-gray-400 tw-transition-colors tw-duration-200"
                placeholder="请输入昵称"
              />
            </div>

            <!-- 账号 -->
            <div>
              <label for="register-username" class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300 tw-mb-2">
                账号 *
              </label>
              <input
                id="register-username"
                v-model="registerParam.username"
                type="text"
                name="username"
                :class="[
                  'tw-w-full tw-px-4 tw-py-3 tw-border tw-rounded-lg tw-focus:tw-ring-2 tw-focus:tw-ring-green-500 tw-focus:tw-border-green-500 tw-transition-colors tw-duration-200',
                  registerFormErrors.username 
                    ? 'tw-border-red-500 tw-bg-red-50 dark:tw-bg-red-900/20' 
                    : 'tw-border-gray-300 dark:tw-border-gray-600 tw-bg-white dark:tw-bg-gray-700'
                ]"
                class="tw-text-gray-900 dark:tw-text-white tw-placeholder-gray-500 dark:tw-placeholder-gray-400"
                placeholder="请输入账号"
              />
              <p v-if="registerFormErrors.username" class="tw-mt-1 tw-text-sm tw-text-red-600 dark:tw-text-red-400">
                {{ registerFormErrors.username }}
              </p>
            </div>

            <!-- 密码 -->
            <div>
              <label for="register-password" class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300 tw-mb-2">
                密码 *
              </label>
              <div class="tw-relative">
                <input
                  id="register-password"
                  v-model="registerParam.password"
                  :type="lookRegisterPS ? 'text' : 'password'"
                  name="password"
                  :class="[
                    'tw-w-full tw-px-4 tw-py-3 tw-pr-12 tw-border tw-rounded-lg tw-focus:tw-ring-2 tw-focus:tw-ring-green-500 tw-focus:tw-border-green-500 tw-transition-colors tw-duration-200',
                    registerFormErrors.password 
                      ? 'tw-border-red-500 tw-bg-red-50 dark:tw-bg-red-900/20' 
                      : 'tw-border-gray-300 dark:tw-border-gray-600 tw-bg-white dark:tw-bg-gray-700'
                  ]"
                  class="tw-text-gray-900 dark:tw-text-white tw-placeholder-gray-500 dark:tw-placeholder-gray-400"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  @click="lookRegisterPS = !lookRegisterPS"
                  class="tw-absolute tw-right-3 tw-top-1/2 tw--tw-translate-y-1/2 tw-text-gray-400 tw-hover:tw-text-gray-600 dark:tw-hover:tw-text-gray-300 tw-transition-colors"
                >
                  <EyeIcon v-if="!lookRegisterPS" class="tw-w-5 tw-h-5" />
                  <EyeSlashIcon v-else class="tw-w-5 tw-h-5" />
                </button>
              </div>
              <p v-if="registerFormErrors.password" class="tw-mt-1 tw-text-sm tw-text-red-600 dark:tw-text-red-400">
                {{ registerFormErrors.password }}
              </p>
            </div>

            <!-- 确认密码 -->
            <div>
              <label for="confirm-password" class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300 tw-mb-2">
                确认密码 *
              </label>
              <div class="tw-relative">
                <input
                  id="confirm-password"
                  v-model="registerParam.againPassword"
                  :type="lookRegisterAPS ? 'text' : 'password'"
                  name="confirmPassword"
                  :class="[
                    'tw-w-full tw-px-4 tw-py-3 tw-pr-12 tw-border tw-rounded-lg tw-focus:tw-ring-2 tw-focus:tw-ring-green-500 tw-focus:tw-border-green-500 tw-transition-colors tw-duration-200',
                    registerFormErrors.againPassword 
                      ? 'tw-border-red-500 tw-bg-red-50 dark:tw-bg-red-900/20' 
                      : 'tw-border-gray-300 dark:tw-border-gray-600 tw-bg-white dark:tw-bg-gray-700'
                  ]"
                  class="tw-text-gray-900 dark:tw-text-white tw-placeholder-gray-500 dark:tw-placeholder-gray-400"
                  placeholder="请确认密码"
                />
                <button
                  type="button"
                  @click="lookRegisterAPS = !lookRegisterAPS"
                  class="tw-absolute tw-right-3 tw-top-1/2 tw--tw-translate-y-1/2 tw-text-gray-400 tw-hover:tw-text-gray-600 dark:tw-hover:tw-text-gray-300 tw-transition-colors"
                >
                  <EyeIcon v-if="!lookRegisterAPS" class="tw-w-5 tw-h-5" />
                  <EyeSlashIcon v-else class="tw-w-5 tw-h-5" />
                </button>
              </div>
              <p v-if="registerFormErrors.againPassword" class="tw-mt-1 tw-text-sm tw-text-red-600 dark:tw-text-red-400">
                {{ registerFormErrors.againPassword }}
              </p>
            </div>

            <div class="tw-flex tw-space-x-3 tw-pt-4">
              <button
                type="button"
                @click="registerDialog = false"
                class="tw-flex-1 tw-px-4 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-lg tw-text-gray-700 dark:tw-text-gray-300 tw-hover:tw-bg-gray-50 dark:tw-hover:tw-bg-gray-700 tw-transition-colors tw-duration-200"
              >
                取消
              </button>
              <button
                type="submit"
                class="tw-flex-1 tw-bg-green-600 tw-hover:tw-bg-green-700 tw-text-white tw-font-medium tw-py-3 tw-px-4 tw-rounded-lg tw-transition-colors tw-duration-200"
              >
                注册
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <GlobalConfirm />
  </div>
</template>

<style scoped>
.tw--tw-translate-y-1\/2 {
  transform: translateY(-50%);
}
</style>
