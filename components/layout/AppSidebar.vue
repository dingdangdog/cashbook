<script setup lang="ts">
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
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
  isDark: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  navigate: [path: string];
  toggleTheme: [];
}>();

const items: Menu[] = [
  {
    title: "账本日历",
    path: "calendar",
    icon: CalendarDaysIcon,
    color: "tw-text-blue-500",
  },
  {
    title: "数据分析",
    path: "analysis",
    icon: ChartBarIcon,
    color: "tw-text-purple-500",
  },
  {
    title: "预算管理",
    path: "budget",
    icon: ExclamationTriangleIcon,
    color: "tw-text-red-500",
  },
  {
    title: "流水管理",
    path: "flows",
    icon: CurrencyDollarIcon,
    color: "tw-text-green-500",
  },
  {
    title: "账本管理",
    path: "books",
    icon: BookOpenIcon,
    color: "tw-text-teal-500",
  },
  {
    title: "类型管理",
    path: "types",
    icon: Squares2X2Icon,
    color: "tw-text-pink-500",
  },
  {
    title: "文档站",
    path: "documentation",
    icon: DocumentTextIcon,
    color: "tw-text-indigo-500",
  },
  {
    title: "Github",
    path: "github",
    icon: CodeBracketIcon,
    color: "tw-text-gray-600 dark:tw-text-gray-400",
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
    class="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-40 lg:tw-hidden"
  ></div>

  <!-- Sidebar -->
  <aside
    :class="[
      'tw-fixed tw-inset-y-0 tw-left-0 tw-z-50 tw-w-64 tw-bg-white dark:tw-bg-gray-900 tw-border-r tw-border-gray-200 dark:tw-border-gray-700 tw-transform tw-transition-transform tw-duration-200 tw-ease-in-out',
      isMobile
        ? isOpen
          ? 'tw-translate-x-0'
          : '-tw-translate-x-full'
        : 'tw-translate-x-0',
      !isMobile && 'lg:tw-relative lg:tw-translate-x-0 tw-h-full',
    ]"
  >
    <div class="tw-flex tw-flex-col tw-h-full">
      <!-- Mobile header -->
      <div
        v-if="isMobile"
        class="tw-flex tw-items-center tw-justify-between tw-p-4 tw-border-b tw-border-gray-200 dark:tw-border-gray-700"
      >
        <div class="tw-flex tw-items-center">
          <img src="/logo.png" alt="Cashbook" class="tw-h-8 tw-w-8" />
          <span class="tw-ml-2 tw-text-lg tw-font-bold tw-text-green-500"
            >Cashbook</span
          >
        </div>
        <button
          @click="emit('close')"
          class="tw-p-2 tw-rounded-md tw-text-gray-600 dark:tw-text-gray-400 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-800"
        >
          <XMarkIcon class="tw-h-6 tw-w-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="tw-flex-1 tw-p-4 tw-space-y-2">
        <button
          v-for="item in items"
          :key="item.path"
          @click="handleNavigate(item)"
          :class="[
            'tw-w-full tw-flex tw-items-center tw-px-3 tw-py-2 tw-rounded-lg tw-text-left tw-transition-colors tw-duration-200',
            currentPath === item.path
              ? 'tw-bg-blue-50 dark:tw-bg-blue-900/20 tw-text-blue-600 dark:tw-text-blue-300 tw-border tw-border-blue-200 dark:tw-border-blue-700'
              : 'tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-800',
          ]"
        >
          <component
            v-if="item.icon !== 'string'"
            :is="item.icon"
            :class="[
              'tw-h-5 tw-w-5 tw-mr-3',
              currentPath === item.path
                ? 'tw-text-blue-600 dark:tw-text-blue-400'
                : item.color,
            ]"
          >
          </component>
          <i
            v-else
            :class="[
              item.icon,
              'tw-text-base tw-mr-3',
              currentPath === item.path
                ? 'tw-text-blue-600 dark:tw-text-blue-400'
                : item.color,
            ]"
          ></i>
          <span class="tw-font-medium">{{ item.title }}</span>
        </button>
      </nav>

      <!-- Theme toggle -->
      <div
        class="tw-p-4 tw-border-t tw-border-gray-200 dark:tw-border-gray-700"
      >
        <button
          @click="emit('toggleTheme')"
          class="tw-w-full tw-flex tw-items-center tw-justify-center tw-px-3 tw-py-2 tw-rounded-lg tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-800 tw-transition-colors tw-font-medium"
        >
          <SunIcon
            v-if="!isDark"
            class="tw-h-5 tw-w-5 tw-mr-2 tw-text-yellow-500"
          />
          <MoonIcon v-else class="tw-h-5 tw-w-5 tw-mr-2 tw-text-blue-300" />
          <span>{{ isDark ? "深色模式" : "浅色模式" }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>
