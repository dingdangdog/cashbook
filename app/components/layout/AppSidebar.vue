<script setup lang="ts">
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  Squares2X2Icon,
  BookOpenIcon,
  CodeBracketIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
  UsersIcon,
  CpuChipIcon,
  SwatchIcon,
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";

interface Menu {
  title: string;
  icon?: any;
  color?: string;
  path?: string;
  children?: Menu[];
}

interface Props {
  isOpen: boolean;
  isMobile: boolean;
  currentPath: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  navigate: [path: string];
}>();

const themeStore = useThemeStore();
const userStore = useUserStore();
const isDark = computed(() => themeStore.isDark);

const toggleTheme = () => {
  themeStore.toggleTheme();
};

/** 普通用户菜单 */
const userMenuItems: Menu[] = [
  {
    title: "账本日历",
    path: "/user/calendar",
    icon: CalendarDaysIcon,
    color: "text-green-500",
  },
  {
    title: "流水管理",
    path: "/user/flows",
    icon: CurrencyDollarIcon,
    color: "text-green-500",
  },
  {
    title: "待收款",
    path: "/user/receivable",
    icon: BanknotesIcon,
    color: "text-green-500",
  },
  {
    title: "预算管理",
    path: "/user/budget",
    icon: ExclamationTriangleIcon,
    color: "text-red-500",
  },
  {
    title: "数据分析",
    path: "/user/analysis",
    icon: ChartBarIcon,
    color: "text-purple-500",
  },
  {
    title: "类型管理",
    path: "/user/types",
    icon: Squares2X2Icon,
    color: "text-pink-500",
  },
];

/** 管理员菜单（仅管理员可见） */
const adminMenuItems: Menu[] = [
  {
    title: "用户管理",
    path: "/admin/users",
    icon: UsersIcon,
    color: "text-indigo-500",
  },
  {
    title: "AI服务管理",
    path: "/admin/ais",
    icon: CpuChipIcon,
    color: "text-indigo-500",
  },
  {
    title: "主题管理",
    path: "/admin/themes",
    icon: SwatchIcon,
    color: "text-indigo-500",
  },
  {
    title: "系统设置",
    path: "/admin/config",
    icon: Cog6ToothIcon,
    color: "text-indigo-500",
  },
];

/** 辅助菜单（文档、外链等） */
const auxiliaryMenuItems: Menu[] = [
  {
    title: "文档站",
    path: "documentation",
    icon: BookOpenIcon,
    color: "text-indigo-500",
  },
  {
    title: "接口文档",
    path: "/api-docs",
    icon: DocumentMagnifyingGlassIcon,
    color: "text-indigo-500",
  },
  {
    title: "Github",
    path: "github",
    icon: CodeBracketIcon,
    color: "text-gray-600 dark:text-gray-400",
  },
];

const isAdmin = computed(() => userStore.isAdmin);

/** 规范化当前路径（父组件可能传 "user/flows" 或 "/user/flows"），与 item.path 统一比较 */
const normalizedCurrentPath = computed(() => {
  const p = props.currentPath?.trim() || "";
  return p.startsWith("/") ? p : p ? `/${p}` : "";
});

const isActive = (itemPath: string | undefined) =>
  itemPath ? normalizedCurrentPath.value === itemPath : false;

const handleNavigate = (menu: Menu) => {
  if (menu.path === "github") {
    window.open("https://github.com/dingdangdog/cashbook", "_blank");
    return;
  } else if (menu.path === "documentation") {
    // 打开文档站，可以根据需要修改为实际的文档URL
    window.open("https://doc.cashbook.oldmoon.top", "_blank");
    return;
  }
  // emit("navigate", menu.path || "calendar");
  navigateTo(menu.path || "/");
  // navigateTo({ path: `/${menu.path}` });
  if (props.isMobile) {
    emit("close");
  }
};
</script>

<template>
  <!-- Mobile backdrop -->
  <div
    v-if="isMobile && isOpen"
    @click="emit('close')"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
  ></div>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200 ease-in-out',
      isMobile
        ? isOpen
          ? 'translate-x-0'
          : '-translate-x-full'
        : 'translate-x-0',
      !isMobile && 'lg:relative lg:translate-x-0 h-full',
    ]"
  >
    <div class="flex flex-col h-full bg-surface-muted">
      <!-- Mobile header -->
      <div
        v-if="isMobile"
        class="flex items-center justify-between p-2 md:p-4 border-b border-border"
      >
        <div class="flex items-center">
          <img src="/logo.webp" alt="Cashbook" class="h-8 w-8" />
          <span class="ml-2 text-lg font-bold text-primary-600">Cashbook</span>
        </div>
        <button
          @click="emit('close')"
          class="p-2 rounded-md text-foreground/70 hover:bg-surface"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-1">
        <!-- 普通用户菜单 -->
        <p
          class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/50"
        >
          主要功能
        </p>
        <div class="space-y-0.5">
          <button
            v-for="item in userMenuItems"
            :key="item.path"
            @click="handleNavigate(item)"
            :class="[
              'w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 outline-none border-l-4',
              isActive(item.path)
                ? 'bg-primary-100/90 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-l-primary-500 shadow-sm'
                : 'border-l-transparent text-foreground/80 hover:bg-surface hover:border-l-foreground/10',
            ]"
          >
            <component
              v-if="item.icon !== 'string'"
              :is="item.icon"
              :class="[
                'h-5 w-5 mr-3 shrink-0',
                isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : 'text-muted',
              ]"
            />
            <i
              v-else
              :class="[
                item.icon,
                'text-base mr-3 shrink-0',
                isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : 'text-muted',
              ]"
            ></i>
            <span :class="isActive(item.path) ? 'font-semibold' : 'font-medium'">{{ item.title }}</span>
          </button>
        </div>

        <!-- 管理员菜单 -->
        <template v-if="isAdmin">
          <div class="my-3 border-t border-border"></div>
          <p
            class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/50"
          >
            系统管理
          </p>
          <div class="space-y-0.5">
            <button
              v-for="item in adminMenuItems"
              :key="item.path"
              @click="handleNavigate(item)"
              :class="[
                'w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 outline-none border-l-4',
                isActive(item.path)
                  ? 'bg-primary-100/90 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-l-primary-500 shadow-sm'
                  : 'border-l-transparent text-foreground/80 hover:bg-surface hover:border-l-foreground/10',
              ]"
            >
              <component
                v-if="item.icon !== 'string'"
                :is="item.icon"
                :class="[
                  'h-5 w-5 mr-3 shrink-0',
                  isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : 'text-muted',
                ]"
              />
              <i
                v-else
                :class="[
                  item.icon,
                  'text-base mr-3 shrink-0',
                  isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : 'text-muted',
                ]"
              ></i>
              <span :class="isActive(item.path) ? 'font-semibold' : 'font-medium'">{{ item.title }}</span>
            </button>
          </div>
        </template>

        <!-- 辅助菜单 -->
        <div class="my-3 border-t border-border"></div>
        <p
          class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/50"
        >
          其他
        </p>
        <div class="space-y-0.5">
          <button
            v-for="item in auxiliaryMenuItems"
            :key="item.path"
            @click="handleNavigate(item)"
            :class="[
              'w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 outline-none border-l-4',
              isActive(item.path)
                ? 'bg-primary-100/90 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-l-primary-500 shadow-sm'
                : 'border-l-transparent text-foreground/80 hover:bg-surface hover:border-l-foreground/10',
            ]"
          >
            <component
              v-if="item.icon !== 'string'"
              :is="item.icon"
              :class="[
                'h-5 w-5 mr-3 shrink-0',
                isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : 'text-muted',
              ]"
            />
            <i
              v-else
              :class="[
                item.icon,
                'text-base mr-3 shrink-0',
                isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : 'text-muted',
              ]"
            ></i>
            <span :class="isActive(item.path) ? 'font-semibold' : 'font-medium'">{{ item.title }}</span>
          </button>
        </div>
      </nav>

      <!-- Theme toggle -->
      <div class="p-4 border-t border-border">
        <button
          @click="toggleTheme"
          class="w-full flex items-center justify-center px-3 py-2 rounded-lg text-foreground hover:bg-surface transition-colors font-medium"
        >
          <SunIcon
            v-if="!isDark"
            class="h-5 w-5 mr-2 shrink-0 text-foreground"
          />
          <MoonIcon v-else class="h-5 w-5 mr-2 shrink-0 text-foreground" />
          <span>{{ isDark ? "深色模式" : "浅色模式" }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>
