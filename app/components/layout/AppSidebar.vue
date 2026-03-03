<script setup lang="ts">
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  CodeBracketIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
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

// 直接使用主题管理
const { isDark, toggleTheme } = useAppTheme();

const items: Menu[] = [
  {
    title: "账本日历",
    path: "calendar",
    icon: CalendarDaysIcon,
    color: "text-brand-500",
  },
  {
    title: "数据分析",
    path: "analysis",
    icon: ChartBarIcon,
    color: "text-brand-500",
  },
  {
    title: "流水管理",
    path: "flows",
    icon: CurrencyDollarIcon,
    color: "text-brand-500",
  },
  {
    title: "待收款",
    path: "receivable",
    icon: BanknotesIcon,
    color: "text-brand-500",
  },
  {
    title: "预算管理",
    path: "budget",
    icon: ExclamationTriangleIcon,
    color: "text-state-warning",
  },
  {
    title: "账本管理",
    path: "books",
    icon: BookOpenIcon,
    color: "text-brand-500",
  },
  {
    title: "类型管理",
    path: "types",
    icon: Squares2X2Icon,
    color: "text-brand-500",
  },
  {
    title: "文档站",
    path: "documentation",
    icon: DocumentTextIcon,
    color: "text-brand-500",
  },
  {
    title: "Github",
    path: "github",
    icon: CodeBracketIcon,
    color: "text-ink-muted dark:text-ink-onDark",
  },
];

const handleNavigate = (menu: Menu) => {
  if (menu.path === "github") {
    window.open("https://github.com/dingdangdog/cashbook", "_blank");
    return;
  } else if (menu.path === "documentation") {
    // 打开文档站，可以根据需要修改为实际的文档URL
    window.open("https://doc.cashbook.oldmoon.top", "_blank");
    return;
  }
  emit("navigate", menu.path || "calendar");
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
      'fixed inset-y-0 left-0 z-50 w-64 bg-surface dark:bg-surface-dark border-r border-frame dark:border-frame-dark transform transition-transform duration-200 ease-in-out',
      isMobile
        ? isOpen
          ? 'translate-x-0'
          : '-translate-x-full'
        : 'translate-x-0',
      !isMobile && 'lg:relative lg:translate-x-0 h-full',
    ]"
  >
    <div class="flex flex-col h-full bg-surface-muted dark:bg-surface-darkMuted">
      <!-- Mobile header -->
      <div
        v-if="isMobile"
        class="flex items-center justify-between p-4 border-b border-frame-light dark:border-frame-dark"
      >
        <div class="flex items-center">
          <img src="/logo.png" alt="Cashbook" class="h-8 w-8" />
          <span class="ml-2 text-lg font-bold text-brand-600">Cashbook</span>
        </div>
        <button
          @click="emit('close')"
          class="p-2 rounded-md text-ink-muted dark:text-ink-onDark hover:bg-surface-soft dark:hover:bg-surface-darkMuted"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2">
        <button
          v-for="item in items"
          :key="item.path"
          @click="handleNavigate(item)"
          :class="[
            'w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 outline-none',
            currentPath === item.path
              ? 'bg-surface-soft dark:bg-surface-darkMuted text-brand-700 dark:text-brand-300 border border-frame dark:border-frame-dark'
              : 'text-ink-secondary dark:text-ink-onDark hover:bg-surface-soft dark:hover:bg-surface-darkMuted',
          ]"
        >
          <component
            v-if="item.icon !== 'string'"
            :is="item.icon"
            :class="[
              'h-5 w-5 mr-3',
              currentPath === item.path
                ? 'text-brand-600 dark:text-brand-400'
                : item.color,
            ]"
          >
          </component>
          <i
            v-else
            :class="[
              item.icon,
              'text-base mr-3',
              currentPath === item.path
                ? 'text-brand-600 dark:text-brand-400'
                : item.color,
            ]"
          ></i>
          <span class="font-medium">{{ item.title }}</span>
        </button>
      </nav>

      <!-- Theme toggle -->
      <div class="p-4 border-t border-frame-light dark:border-frame-dark">
        <button
          @click="toggleTheme"
          class="w-full flex items-center justify-center px-3 py-2 rounded-lg text-ink-secondary dark:text-ink-onDark hover:bg-surface-soft dark:hover:bg-surface-darkMuted transition-colors font-medium"
        >
          <SunIcon v-if="!isDark" class="h-5 w-5 mr-2 text-yellow-500" />
          <MoonIcon v-else class="h-5 w-5 mr-2 text-green-300" />
          <span>{{ isDark ? "深色模式" : "浅色模式" }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>
