<template>
  <div class="w-full overflow-hidden">
    <!-- Calendar Header -->
    <div
      class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-500 to-cyan-600 dark:from-green-900 dark:to-cyan-900 text-white"
    >
      <button
        @click="prevMonth"
        class="p-1.5 rounded-md hover:bg-white/10 transition-colors duration-200"
      >
        <ChevronLeftIcon class="w-5 h-5" />
      </button>

      <h2 class="text-sm font-semibold flex-1 text-center">
        {{ currentMonthText }}
      </h2>

      <button
        @click="nextMonth"
        class="p-1.5 rounded-md hover:bg-white/10 transition-colors duration-200"
      >
        <ChevronRightIcon class="w-5 h-5" />
      </button>

      <button
        @click="showAnalysis"
        class="flex items-center gap-1 px-2.5 py-1.5 ml-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors duration-200"
      >
        <ChartBarIcon class="w-4 h-4" />
        <span class="text-xs font-medium">分析</span>
      </button>
    </div>

    <!-- Weekday Headers -->
    <div
      class="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600"
    >
      <div
        v-for="day in weekdays"
        :key="day"
        class="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800">
      <div
        v-for="date in calendarDates"
        :key="date.key"
        class="min-h-20 p-1 bg-white dark:bg-gray-800 flex flex-col relative border-b border-r border-gray-200 dark:border-gray-700 last:border-b-0"
        :class="{
          'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600':
            !date.isCurrentMonth,
          'bg-blue-50 dark:bg-blue-900/20': date.isToday,
          'bg-yellow-50 dark:bg-yellow-900/10':
            date.isWeekend && date.isCurrentMonth,
        }"
      >
        <!-- Date and Add Button -->
        <div class="flex justify-between items-start mb-1">
          <span
            class="text-xs font-medium"
            :class="{
              'text-blue-600 dark:text-blue-400 font-bold': date.isToday,
              'text-gray-900 dark:text-gray-100':
                date.isCurrentMonth && !date.isToday,
              'text-gray-400 dark:text-gray-600': !date.isCurrentMonth,
            }"
          >
            {{ date.day }}
          </span>
          <button
            v-if="date.isCurrentMonth"
            @click="addFlow(date)"
            class="w-4 h-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 opacity-60 hover:opacity-100"
          >
            <PlusIcon class="w-3 h-3" />
          </button>
        </div>

        <!-- Flow Data -->
        <div v-if="date.isCurrentMonth" class="flex flex-col gap-0.5 flex-1">
          <!-- Expense -->
          <div
            v-if="getDateExpense(date.dateString)"
            @click="clickDay(date.dateString, '支出')"
            class="flex items-center gap-1 px-1 py-0.5 rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
            :class="getExpenseClass(getDateExpense(date.dateString))"
          >
            <ArrowUpIcon class="w-2.5 h-2.5" />
            <span>{{ getDateExpense(date.dateString).toFixed(0) }}</span>
          </div>
          <!-- Income -->
          <div
            v-if="getDateIncome(date.dateString)"
            @click="clickDay(date.dateString, '收入')"
            class="flex items-center gap-1 px-1 py-0.5 rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:-translate-y-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900"
          >
            <ArrowDownIcon class="w-2.5 h-2.5" />
            <span>{{ getDateIncome(date.dateString).toFixed(0) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
} from "@heroicons/vue/24/outline";

interface CalendarDate {
  date: Date;
  dateString: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  key: string;
}

interface Props {
  currentDate: Date;
  incomeData: Record<string, number>;
  expenseData: Record<string, number>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "add-flow": [date: CalendarDate];
  "click-day": [dateString: string, flowType: string];
  "month-change": [date: Date];
  "show-analysis": [month: string];
}>();

const currentDate = ref(new Date(props.currentDate));

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

const currentMonthText = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth() + 1;
  return `${year} 年 ${month} 月`;
});

const calendarDates = computed((): CalendarDate[] => {
  const dates: CalendarDate[] = [];
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  // Get first day of month and calculate start of calendar
  const firstDay = new Date(year, month, 1);
  const startDay = new Date(firstDay);
  startDay.setDate(startDay.getDate() - firstDay.getDay());

  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDay);
    date.setDate(startDay.getDate() + i);

    const isCurrentMonth = date.getMonth() === month;
    const isToday = isSameDay(date, new Date());
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    dates.push({
      date: new Date(date),
      dateString: formatDate(date),
      day: date.getDate(),
      isCurrentMonth,
      isToday,
      isWeekend,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    });
  }

  return dates;
});

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getDateIncome = (dateString: string): number => {
  return props.incomeData[dateString] || 0;
};

const getDateExpense = (dateString: string): number => {
  return props.expenseData[dateString] || 0;
};

const getExpenseClass = (amount: number): string => {
  if (amount >= 1000)
    return "bg-red-500 dark:bg-red-700 text-white hover:bg-red-600";
  if (amount >= 500)
    return "bg-orange-500 dark:bg-orange-700 text-white hover:bg-orange-600";
  return "bg-yellow-500 dark:bg-yellow-700 text-white hover:bg-yellow-600";
};

const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
  emit("month-change", currentDate.value);
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
  emit("month-change", currentDate.value);
};

const addFlow = (date: CalendarDate) => {
  emit("add-flow", date);
};

const clickDay = (dateString: string, flowType: string) => {
  emit("click-day", dateString, flowType);
};

const showAnalysis = () => {
  emit("show-analysis", currentMonthText.value);
};

// Watch for prop changes
watch(
  () => props.currentDate,
  (newDate) => {
    currentDate.value = new Date(newDate);
  }
);
</script>
