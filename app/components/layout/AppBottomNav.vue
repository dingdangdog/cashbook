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
    color: "text-red-500",
  },
  {
    title: "分析",
    path: "analysis",
    icon: ChartBarIcon,
    color: "text-purple-500",
  },
  {
    title: "日历",
    path: "calendar",
    icon: CalendarDaysIcon,
    color: "text-blue-500",
  },
  {
    title: "流水",
    path: "flows",
    icon: CurrencyDollarIcon,
    color: "text-green-500",
  },
  {
    title: "账本",
    path: "books",
    icon: BookOpenIcon,
    color: "text-teal-500",
  },
];

const handleNavigate = (path: string) => {
  emit("navigate", path);
  // navigateTo({ path: `/${path}` });
};
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 lg:hidden"
  >
    <div class="grid grid-cols-5 h-16 bg-surface-muted">
      <button
        v-for="item in bottomNavItems"
        :key="item.path"
        @click="handleNavigate(item.path)"
        :class="[
          'flex flex-col items-center justify-center space-y-1 transition-colors duration-200 text-primary-600',
          currentPath == item.path
            ? ' bg-primary-500/20 font-bold'
            : 'font-medium',
        ]"
      >
        <component :is="item.icon" :class="['h-5 w-5', item.color]" />
        <span class="text-xs font-medium">{{ item.title }}</span>
      </button>
    </div>
  </nav>
</template>
