<script setup lang="ts">
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
} from "@heroicons/vue/24/outline";

interface NavItem {
  title: string;
  icon: any;
  path: string;
  color: string;
}

interface Props {
  currentPath: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigate: [path: string];
}>();

const bottomNavItems: NavItem[] = [
  {
    title: "预算",
    path: "budget",
    icon: ExclamationTriangleIcon,
    color: "tw-text-red-500",
  },
  {
    title: "分析",
    path: "analysis",
    icon: ChartBarIcon,
    color: "tw-text-purple-500",
  },
  {
    title: "日历",
    path: "calendar",
    icon: CalendarDaysIcon,
    color: "tw-text-blue-500",
  },
  {
    title: "流水",
    path: "flows",
    icon: CurrencyDollarIcon,
    color: "tw-text-green-500",
  },
  {
    title: "账本",
    path: "books",
    icon: BookOpenIcon,
    color: "tw-text-teal-500",
  },
];

const handleNavigate = (path: string) => {
  emit("navigate", path);
  // navigateTo({ path: `/${path}` });
};
</script>

<template>
  <nav
    class="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white dark:tw-bg-gray-900 tw-border-t tw-border-gray-200 dark:tw-border-gray-700 tw-z-40 lg:tw-hidden"
  >
    <div class="tw-grid tw-grid-cols-5 tw-h-16">
      <button
        v-for="item in bottomNavItems"
        :key="item.path"
        @click="handleNavigate(item.path)"
        :class="[
          'tw-flex tw-flex-col tw-items-center tw-justify-center tw-space-y-1 tw-transition-colors tw-duration-200',
          currentPath === item.path
            ? 'tw-text-blue-600 dark:tw-text-blue-400 tw-bg-blue-300/20'
            : 'tw-text-gray-600 dark:tw-text-gray-400',
        ]"
      >
        <component :is="item.icon" :class="['tw-h-5 tw-w-5', item.color]" />
        <span class="tw-text-xs tw-font-medium">{{ item.title }}</span>
      </button>
    </div>
  </nav>
</template>
