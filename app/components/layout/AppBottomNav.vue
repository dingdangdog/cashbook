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
    color: "text-state-warning",
  },
  {
    title: "分析",
    path: "analysis",
    icon: ChartBarIcon,
    color: "text-brand-500",
  },
  {
    title: "日历",
    path: "calendar",
    icon: CalendarDaysIcon,
    color: "text-brand-500",
  },
  {
    title: "流水",
    path: "flows",
    icon: CurrencyDollarIcon,
    color: "text-brand-500",
  },
  {
    title: "账本",
    path: "books",
    icon: BookOpenIcon,
    color: "text-brand-500",
  },
];

const handleNavigate = (path: string) => {
  emit("navigate", path);
  // navigateTo({ path: `/${path}` });
};
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-surface dark:bg-surface-dark border-t border-frame dark:border-frame-dark z-40 lg:hidden"
  >
    <div class="grid grid-cols-5 h-16 bg-surface-muted dark:bg-surface-darkMuted">
      <button
        v-for="item in bottomNavItems"
        :key="item.path"
        @click="handleNavigate(item.path)"
        :class="[
          'flex flex-col items-center justify-center space-y-1 transition-colors duration-200 text-ink-secondary dark:text-ink-onDark',
          currentPath == item.path
            ? 'bg-brand-100 dark:bg-brand-900 font-bold text-brand-700 dark:text-brand-300'
            : 'font-medium',
        ]"
      >
        <component :is="item.icon" :class="['h-5 w-5', item.color]" />
        <span class="text-xs font-medium">{{ item.title }}</span>
      </button>
    </div>
  </nav>
</template>
