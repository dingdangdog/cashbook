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
          v-if="chartType === 'industry'"
          :title="title"
          :width="chartWidth"
          :height="chartHeight"
        />
        <PayTypePie
          v-else-if="chartType === 'paytype'"
          :title="title"
          :width="chartWidth"
          :height="chartHeight"
        />
        <AttributionPie
          v-else-if="chartType === 'attribution'"
          :title="title"
          :width="chartWidth"
          :height="chartHeight"
        />
        <DailyLineChart
          v-else-if="chartType === 'daily'"
          :title="title"
          :width="chartWidth"
          :height="chartHeight"
        />
        <MonthBar
          v-else-if="chartType === 'month'"
          :title="title"
          :width="chartWidth"
          :height="chartHeight"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
