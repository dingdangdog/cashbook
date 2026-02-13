<script setup lang="ts">
const logout = () => {
  doApi.get("api/admin/logout").then(() => {
    Alert.success("Logout success");
    navigateTo("/admin/login");
  });
};

const miniWindow = ref(false);
const menuer = ref(false);

onMounted(() => {
  miniWindow.value = window.innerWidth < 1280;
  menuer.value = !miniWindow.value;
});

const toIndex = () => {
  navigateTo("/admin/");
};

type Menu = {
  title: string;
  icon?: string;
  path?: string;
  children?: Menu[];
};

const openMenu = ref<string>("orders");

const items = ref<Menu[]>([
  { title: "去记账", path: "website", icon: "home" },
  { title: "用户", path: "users", icon: "user" },
  { title: "账本", path: "books", icon: "book-open" },
  { title: "映射管理", path: "typeRelations", icon: "arrows-right-left" },
  { title: "主题", path: "themes", icon: "paint-brush" },
  { title: "系统配置", path: "config", icon: "cog-6-tooth" },
  { title: "AI 服务商", path: "ais", icon: "cpu" },
  { title: "文档站", path: "documentation", icon: "document-text" },
  { title: "Github", path: "github", icon: "code-bracket" },
]);

const toPath = (menu: Menu) => {
  if (menu.path == "website") {
    window.open(`/`, "_blank");
    return;
  } else if (menu.path == "github") {
    window.open(`https://github.com/dingdangdog/cashbook`, "_blank");
    return;
  } else if (menu.path == "documentation") {
    toDocumentation();
    return;
  }

  openMenu.value = menu.path || "home";
  navigateTo({ path: `/admin/${openMenu.value}` });
};

// 获取当前路径
const route = useRoute();
const currentPath = computed(() => {
  const path = route.path.replace("/admin/", "").replace("/admin", "");
  return path || "index";
});

// 更新选中的菜单
watch(
  () => route.path,
  (newPath) => {
    const path = newPath.replace("/admin/", "").replace("/admin", "");
    openMenu.value = path || "index";
  },
  { immediate: true }
);

// 获取图标组件
const getIconComponent = (iconName: string) => {
  const icons = {
    home: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
    user: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    "book-open":
      "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    "arrows-right-left":
      "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
    "cog-6-tooth":
      "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    "document-text":
      "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    "paint-brush":
      "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75v-.75z",
    "code-bracket":
      "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
    cpu: "M8.25 3v1.5M4.5 3v1.5M3 18.75V16.5m0-2.25v-1.5M3 12h1.5m12 0h1.5M3 7.5V6m0 2.25v1.5M21 18.75V16.5m0-2.25v-1.5M21 12h-1.5m-12 0H3m15 4.5v1.5m0 2.25V18M15 7.5v-1.5m0 2.25V6M7.5 21H9m-1.5 0h-3m12 0h1.5m-12 0H6m12 3v-1.5m0 2.25V15m0 2.25v1.5M15 21v-1.5m0-2.25V15m0 2.25v1.5M9 21v-1.5M9 18H6m12 0h3",
  };
  return icons[iconName as keyof typeof icons] || icons.home;
};
</script>

<template>
  <Head>
    <Title>{{ SystemConfig?.title }} - 管理</Title>
  </Head>

  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900"
  >
    <!-- 顶部导航栏 -->
    <header
      class="bg-green-900/10 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40"
    >
      <div class="flex items-center justify-between px-4 py-3">
        <!-- 左侧：菜单按钮和Logo -->
        <div class="flex items-center space-x-4">
          <!-- 移动端菜单按钮 -->
          <button
            v-if="miniWindow"
            @click="menuer = !menuer"
            class="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors lg:hidden"
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
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>

          <!-- Logo和标题 -->
          <button
            @click="toIndex"
            class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.webp" class="w-8 h-8 rounded-full" alt="logo" />
            <span class="text-white font-semibold text-lg hidden sm:block">
              {{ SystemConfig?.title }} - 管理
            </span>
          </button>
        </div>

        <!-- 右侧：退出登录 -->
        <button
          @click="logout"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          <span>退出登录</span>
        </button>
      </div>
    </header>

    <div class="flex">
      <!-- 侧边栏 -->
      <aside
        :class="[
          'bg-gray-900/20 backdrop-blur-sm border-r border-gray-700 transition-all duration-300 z-30',
          menuer ? 'w-64' : 'w-0 overflow-hidden',
          miniWindow
            ? 'fixed inset-y-0 left-0 top-16'
            : 'sticky top-16 h-[calc(100vh-4rem)]',
        ]"
      >
        <!-- 遮罩层 (移动端) -->
        <div
          v-if="miniWindow && menuer"
          @click="menuer = false"
          class="fixed inset-0 bg-black/50 z-20 lg:hidden"
        ></div>

        <nav class="p-4 space-y-2 relative z-30">
          <div v-for="(item, i) in items" :key="i" class="group">
            <button
              @click="toPath(item)"
              :class="[
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left',
                currentPath === item.path || openMenu === item.path
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/70',
              ]"
            >
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="getIconComponent(item.icon || 'home')"
                ></path>
              </svg>
              <span class="font-medium">{{ item.title }}</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- 主内容区域 -->
      <main class="flex-1 h-[calc(100vh-4rem)] overflow-y-auto">
        <div class="admin-page-container">
          <slot></slot>
        </div>
      </main>
    </div>

    <GlobalConfirm />
  </div>
</template>

<style>
.admin-page-container {
  padding: 1rem;
  height: calc(100vh - 4rem);
  overflow-y: auto;
  background: transparent;
}

/* 自定义滚动条 */
.admin-page-container::-webkit-scrollbar {
  width: 6px;
}

.admin-page-container::-webkit-scrollbar-track {
  background: rgba(75, 85, 99, 0.3);
  border-radius: 3px;
}

.admin-page-container::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.admin-page-container::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
