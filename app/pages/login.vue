<script setup lang="ts">
definePageMeta({
  unauthenticatedOnly: true,
});

import {
  BookOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/vue/24/outline";

import { SystemConfig } from "~/utils/store";
import { checkSignIn } from "~/utils/common";

const { isDark, toggleTheme } = useAppTheme();

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
  } else if (
    registerParam.value.againPassword !== registerParam.value.password
  ) {
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
    if (res == 0) {
      Confirm.open({
        title: "提示",
        content: '当前系统没有普通用户，请前往【后台】"添加用户"或"开放注册"！',
        confirmText: "前往后台",
        cancelText: "知道了",
        confirm: () => {
          navigateTo("/admin");
        },
      });
    } else if (res == -1) {
      Confirm.open({
        title: "提示",
        content: "你的数据库很可能没有成功连接，请检查！！！",
        confirmText: "知道了",
        cancelText: "我不管了",
        confirm: () => {},
        cancel: () => {},
      });
    }
  });
});

const toDocumentation = () => {
  window.open("https://docs.example.com", "_blank");
};

const toGithub = () => {
  window.open("https://github.com/dingdangdog/cashbook", "_blank");
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

  <div
    :class="[
      'h-screen p-2 transition-colors duration-300',
      isDark
        ? 'bg-gradient-to-br from-green-950 to-gray-800'
        : 'bg-gradient-to-br from-green-50 to-emerald-100',
    ]"
  >
    <!-- 右上角导航栏 -->
    <div class="fixed top-2 right-2 flex items-center gap-2 z-50">
      <!-- 主题切换按钮 - 移到最左侧 -->
      <button
        @click="toggleTheme()"
        :class="[
          'p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg',
          isDark
            ? 'bg-gray-800/80 text-green-400 hover:bg-gray-800'
            : 'bg-white/80 text-green-600 hover:bg-white',
        ]"
        title="切换主题"
      >
        <SunIcon v-if="isDark" class="w-5 h-5" />
        <MoonIcon v-else class="w-5 h-5" />
      </button>

      <button
        @click="toDocumentation()"
        :class="[
          'p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg',
          isDark
            ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-800'
            : 'bg-white/80 text-gray-600 hover:bg-white',
        ]"
        title="文档站"
      >
        <BookOpenIcon class="w-5 h-5" />
      </button>

      <button
        @click="toGithub()"
        :class="[
          'p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg',
          isDark
            ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-800'
            : 'bg-white/80 text-gray-600 hover:bg-white',
        ]"
        title="前往Github"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
      </button>

      <!-- Admin入口按钮 -->
      <button
        @click="toAdmin()"
        :class="[
          'p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg',
          isDark
            ? 'bg-gray-800/80 text-orange-400 hover:bg-gray-800'
            : 'bg-white/80 text-orange-600 hover:bg-white',
        ]"
        title="管理后台"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
      </button>
    </div>

    <div
      class="flex flex-col items-center justify-center h-full p-4 sm:px-4 -mt-12"
    >
      <!-- Logo 和标题 - 响应式调整 -->
      <div
        class="flex flex-col sm:flex-row items-center mb-4 text-center sm:text-left"
      >
        <img
          src="/logo.png"
          class="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-2 sm:mb-0 sm:mr-4"
        />
        <h1
          :class="[
            'text-xl sm:text-2xl lg:text-3xl font-bold',
            isDark ? 'text-white' : 'text-gray-800',
          ]"
        >
          欢迎使用{{ SystemConfig?.title }}
        </h1>
      </div>

      <!-- 登录表单 - 响应式调整 -->
      <div class="w-full max-w-[26rem]">
        <div
          :class="[
            'rounded-xl shadow-xl p-4 md:p-6 border',
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          ]"
        >
          <form @submit.prevent="login" class="space-y-4">
            <!-- 用户名输入 -->
            <div>
              <input
                id="username"
                v-model="loginParam.username"
                type="text"
                name="username"
                autocomplete="username"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200',
                  loginFormErrors.username
                    ? isDark
                      ? 'border-red-500 bg-red-900/20'
                      : 'border-red-500 bg-red-50'
                    : isDark
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-green-950 placeholder-gray-500',
                ]"
                placeholder="请输入账号"
              />
              <p
                v-if="loginFormErrors.username"
                :class="[
                  'mt-1 text-sm',
                  isDark ? 'text-red-400' : 'text-red-600',
                ]"
              >
                {{ loginFormErrors.username }}
              </p>
            </div>

            <!-- 密码输入 -->
            <div>
              <div class="relative">
                <input
                  id="password"
                  v-model="loginParam.password"
                  :type="lookLoginPS ? 'text' : 'password'"
                  name="password"
                  autocomplete="current-password"
                  :class="[
                    'w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200',
                    loginFormErrors.password
                      ? isDark
                        ? 'border-red-500 bg-red-900/20'
                        : 'border-red-500 bg-red-50'
                      : isDark
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-green-950 placeholder-gray-500',
                  ]"
                  placeholder="请输入密码"
                  @keyup.enter="login()"
                />
                <button
                  type="button"
                  @click="lookLoginPS = !lookLoginPS"
                  :class="[
                    'absolute right-2 top-1/2 -translate-y-1/2 transition-colors',
                    isDark
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-400 hover:text-gray-600',
                  ]"
                >
                  <EyeIcon v-if="!lookLoginPS" class="w-4 h-4" />
                  <EyeSlashIcon v-else class="w-4 h-4" />
                </button>
              </div>
              <p
                v-if="loginFormErrors.password"
                :class="[
                  'mt-1 text-sm',
                  isDark ? 'text-red-400' : 'text-red-600',
                ]"
              >
                {{ loginFormErrors.password }}
              </p>
            </div>

            <!-- 登录按钮 -->
            <div>
              <button
                type="submit"
                class="w-full bg-green-600 hover:bg-green-700 text-white font-bold mt-4 py-2 sm:py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none"
              >
                登录
              </button>
            </div>

            <!-- 注册按钮 -->
            <div v-if="openRegister" class="text-center pt-2">
              <button
                type="button"
                @click="registerDialog = true"
                :class="[
                  'font-medium transition-colors duration-200',
                  isDark
                    ? 'text-green-400 hover:text-green-300'
                    : 'text-green-600 hover:text-green-700',
                ]"
              >
                注册账号
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 注册对话框 -->
    <div
      v-if="registerDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        :class="[
          'rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto',
          isDark ? 'bg-gray-800' : 'bg-white',
        ]"
      >
        <div class="p-2">
          <div class="flex justify-between items-center mb-6">
            <h3
              :class="[
                'text-xl font-semibold',
                isDark ? 'text-white' : 'text-green-950',
              ]"
            >
              注册用户
            </h3>
            <button
              @click="registerDialog = false"
              :class="[
                'transition-colors',
                isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-400 hover:text-gray-600',
              ]"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="register" class="space-y-4">
            <!-- 昵称 -->
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                昵称
              </label>
              <input
                id="name"
                v-model="registerParam.name"
                type="text"
                name="name"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                placeholder="请输入昵称"
              />
            </div>

            <!-- 账号 -->
            <div>
              <label
                for="register-username"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                账号 *
              </label>
              <input
                id="register-username"
                v-model="registerParam.username"
                type="text"
                name="username"
                :class="[
                  'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200',
                  registerFormErrors.username
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700',
                ]"
                class="text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="请输入账号"
              />
              <p
                v-if="registerFormErrors.username"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ registerFormErrors.username }}
              </p>
            </div>

            <!-- 密码 -->
            <div>
              <label
                for="register-password"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                密码 *
              </label>
              <div class="relative">
                <input
                  id="register-password"
                  v-model="registerParam.password"
                  :type="lookRegisterPS ? 'text' : 'password'"
                  name="password"
                  :class="[
                    'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200',
                    registerFormErrors.password
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700',
                  ]"
                  class="text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  @click="lookRegisterPS = !lookRegisterPS"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeIcon v-if="!lookRegisterPS" class="w-5 h-5" />
                  <EyeSlashIcon v-else class="w-5 h-5" />
                </button>
              </div>
              <p
                v-if="registerFormErrors.password"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ registerFormErrors.password }}
              </p>
            </div>

            <!-- 确认密码 -->
            <div>
              <label
                for="confirm-password"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                确认密码 *
              </label>
              <div class="relative">
                <input
                  id="confirm-password"
                  v-model="registerParam.againPassword"
                  :type="lookRegisterAPS ? 'text' : 'password'"
                  name="confirmPassword"
                  :class="[
                    'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200',
                    registerFormErrors.againPassword
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700',
                  ]"
                  class="text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="请确认密码"
                />
                <button
                  type="button"
                  @click="lookRegisterAPS = !lookRegisterAPS"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeIcon v-if="!lookRegisterAPS" class="w-5 h-5" />
                  <EyeSlashIcon v-else class="w-5 h-5" />
                </button>
              </div>
              <p
                v-if="registerFormErrors.againPassword"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ registerFormErrors.againPassword }}
              </p>
            </div>

            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                @click="registerDialog = false"
                class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
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
.-translate-y-1\/2 {
  transform: translateY(-50%);
}
</style>
