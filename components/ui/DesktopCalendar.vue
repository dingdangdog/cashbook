<template>
  <div class="w-full">
    <!-- Calendar Header -->
    <div
      class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-950/80 dark:to-emerald-950/80 text-white"
    >
      <!-- Navigation -->
      <div class="flex items-center gap-4">
        <button
          @click="prevMonth"
          class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
        >
          <ChevronLeftIcon class="w-5 h-5" />
        </button>

        <h2 class="text-xl font-bold min-w-40 text-center">
          {{ currentMonthText }}
        </h2>

        <button
          @click="nextMonth"
          class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
        >
          <ChevronRightIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Analysis Button -->
      <button
        @click="showAnalysis"
        class="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 font-medium"
      >
        <ChartBarIcon class="w-5 h-5" />
        当月分析
      </button>
    </div>

    <!-- Weekday Headers -->
    <div
      class="grid grid-cols-7 bg-green-50 dark:bg-transparent border-b border-green-200 dark:border-green-900/30"
    >
      <div
        v-for="day in weekdays"
        :key="day"
        class="py-4 text-center text-sm font-semibold text-green-700 dark:text-green-500/50 uppercase tracking-wide"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-px bg-green-200 dark:bg-transparent">
      <div
        v-for="date in calendarDates"
        :key="date.key"
        class="min-h-36 p-4 flex flex-col relative transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-800/20 hover:-translate-y-0.5 hover:shadow-lg border border-green-50 dark:border-green-900"
        :class="{
          'bg-green-50 dark:bg-transparent text-gray-400 dark:text-green-700':
            !date.isCurrentMonth,
          'bg-green-100 dark:bg-green-800/40 border-2 border-green-400 dark:border-green-700':
            date.isToday,
          'bg-emerald-50/50 dark:bg-green-950/50':
            date.isWeekend && date.isCurrentMonth,
        }"
      >
        <!-- Date and Add Button -->
        <div class="flex justify-between items-start mb-3">
          <span
            class="text-lg font-medium"
            :class="{
              'text-green-600 dark:text-green-500/60 font-bold': date.isToday,
              'text-gray-900 dark:text-gray-100':
                date.isCurrentMonth && !date.isToday,
              'text-gray-400 dark:text-green-700/30': !date.isCurrentMonth,
            }"
          >
            {{ date.day }}
          </span>
          <button
            v-if="date.isCurrentMonth"
            @click="addFlow(date)"
            class="w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 opacity-70 hover:opacity-100"
          >
            <PlusIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Flow Data -->
        <div v-if="date.isCurrentMonth" class="flex flex-col gap-2 flex-1">
          <!-- Expense -->
          <div
            v-if="getDateExpense(date.dateString)"
            @click="clickDay(date.dateString, '支出')"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            :class="getExpenseClass(getDateExpense(date.dateString))"
          >
            <ArrowUpIcon class="w-4 h-4" />
            <span>{{ getDateExpense(date.dateString).toFixed(2) }}</span>
          </div>
          <!-- Income -->
          <div
            v-if="getDateIncome(date.dateString)"
            @click="clickDay(date.dateString, '收入')"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-green-100 dark:bg-transparent dark:border dark:border-green-800/40 text-green-700 dark:text-green-500/60 hover:bg-green-200 dark:hover:bg-green-950/20"
          >
            <ArrowDownIcon class="w-4 h-4" />
            <span>{{ getDateIncome(date.dateString).toFixed(2) }}</span>
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
  if (!amount || amount === 0) {
    return "bg-green-100/50 dark:bg-transparent dark:border dark:border-green-800/30 text-gray-600 dark:text-green-500/50 hover:bg-green-100 dark:hover:bg-green-950/15";
  } else if (amount >= 1000) {
    return "bg-red-500 dark:bg-red-950/50 dark:border dark:border-red-900/40 text-white hover:bg-red-600 dark:hover:bg-red-950/60 shadow-lg";
  } else if (amount >= 500) {
    return "bg-orange-500 dark:bg-orange-950/50 dark:border dark:border-orange-900/40 text-white hover:bg-orange-600 dark:hover:bg-orange-950/60 shadow-lg";
  } else {
    return "bg-yellow-500 dark:bg-yellow-950/50 dark:border dark:border-yellow-900/40 text-white hover:bg-yellow-600 dark:hover:bg-yellow-950/60 shadow-lg";
  }
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
