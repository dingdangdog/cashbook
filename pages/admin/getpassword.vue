<script setup lang="ts">
const entry = ref({
  username: "",
  password: "",
});

const newPassword = ref("");
const newAccount = ref("");
const loading = ref(false);

const getPassword = () => {
  if (!entry.value.username || !entry.value.password) {
    Alert.error("请填写完整信息");
    return;
  }
  
  loading.value = true;
  doApi.post<any>("api/admin/getPassword", entry.value)
    .then((res) => {
      newPassword.value = res;
      newAccount.value = entry.value.username;
      Alert.success("密码加密成功");
    })
    .catch((err) => {
      Alert.error("加密失败: " + err.message);
    })
    .finally(() => {
      loading.value = false;
    });
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    Alert.success("已复制到剪贴板");
  });
};
</script>

<template>
  <Head>
    <Title>密码生成 - {{ SystemConfig?.title }}</Title>
    <Meta name="description" :content="SystemConfig?.description" />
    <Meta
      name="keywords"
      :content="`Cashbook,记账本,私人记账,开源账本,dingdangdog,月上老狗,${SystemConfig?.keywords}`"
    />
  </Head>
  
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
    <div class="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700 w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">Cashbook后台密码加密工具</h1>
        <p class="text-gray-300">生成管理员账号的加密密码</p>
      </div>

      <form @submit.prevent="getPassword" class="space-y-6">
        <!-- 账号输入 -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            管理员账号
          </label>
          <input
            v-model="entry.username"
            type="text"
            required
            autocomplete="admin-account"
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="请输入管理员账号"
          />
        </div>

        <!-- 密码输入 -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            管理员密码
          </label>
          <input
            v-model="entry.password"
            type="password"
            required
            autocomplete="admin-password"
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="请输入管理员密码"
          />
        </div>

        <!-- 加密按钮 -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? '加密中...' : '生成加密密码' }}</span>
        </button>
      </form>

      <!-- 结果显示 -->
      <div v-if="newPassword" class="mt-8 space-y-4">
        <div class="border-t border-gray-600 pt-6">
          <h3 class="text-lg font-medium text-white mb-4">加密结果</h3>
          
          <!-- 账号 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">账号</label>
            <div class="flex items-center space-x-2">
              <input
                :value="newAccount"
                readonly
                class="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm"
              />
              <button
                @click="copyToClipboard(newAccount)"
                class="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                title="复制"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- 加密密码 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">加密密码</label>
            <div class="flex items-center space-x-2">
              <textarea
                :value="newPassword"
                readonly
                rows="3"
                class="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm resize-none"
              ></textarea>
              <button
                @click="copyToClipboard(newPassword)"
                class="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                title="复制"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
            <p class="text-blue-300 text-sm">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              请将加密后的密码保存到系统配置中
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
