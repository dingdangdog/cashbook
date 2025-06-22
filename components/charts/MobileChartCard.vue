<template>
  <div class="mobile-chart-card">
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700 h-full"
    >
      <!-- Card Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <component :is="icon" class="w-5 h-5 text-blue-500" />
          <h3 class="text-lg font-semibold text-green-950 dark:text-white">
            {{ title }}
          </h3>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ currentIndex + 1 }} / {{ totalCount }}
        </div>
      </div>

      <!-- Chart Container -->
      <div class="relative rounded-lg p-1">
        <!-- 根据图表类型显示对应组件 -->
        <IndustryTypePie
          v-if="chartType === 'industry' && isMounted"
          :key="`industry-${currentIndex}`"
          :title="title"
          :width="chartWidth"
          :height="chartHeight"
        />
        <PayTypePie
          v-else-if="chartType === 'paytype' && isMounted"
          :key="`paytype-${currentIndex}`"
          :title="title"
          :width="chartWidth"
          :height="chartHeight"
        />
        <AttributionPie
          v-else-if="chartType === 'attribution' && isMounted"
          :key="`attribution-${currentIndex}`"
          :title="title"
          :width="chartWidth"
          :height="chartHeight"
        />
        <DailyLineChart
          v-else-if="chartType === 'daily' && isMounted"
          :key="`daily-${currentIndex}`"
          :title="title"
          :width="chartWidth"
          :height="chartHeight"
        />
        <MonthBar
          v-else-if="chartType === 'month' && isMounted"
          :key="`month-${currentIndex}`"
          :title="title"
          :width="chartWidth"
          :height="chartHeight"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import IndustryTypePie from "./IndustryTypePie.vue";
import PayTypePie from "./PayTypePie.vue";
import AttributionPie from "./AttributionPie.vue";
import DailyLineChart from "./DailyLineChart.vue";
import MonthBar from "./MonthBar.vue";

defineProps<{
  title: string;
  icon: any;
  currentIndex: number;
  totalCount: number;
  chartType: "industry" | "paytype" | "attribution" | "daily" | "month";
  chartWidth: string;
  chartHeight: string;
}>();

defineEmits<{
  filter: [];
  details: [];
}>();

const isMounted = ref(false);

onMounted(async () => {
  await nextTick();
  isMounted.value = true;
});
</script>

<style scoped>
.mobile-chart-card {
  width: 320px;
  flex-shrink: 0;
  scroll-snap-align: center;
}

@media (max-width: 375px) {
  .mobile-chart-card {
    width: 300px;
  }
}
</style>
