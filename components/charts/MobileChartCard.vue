<template>
  <div class="mobile-chart-card">
    <div
      class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-xl tw-shadow-lg tw-p-3 tw-border tw-border-gray-200 dark:tw-border-gray-700 tw-h-full"
    >
      <!-- Card Header -->
      <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <div class="tw-flex tw-items-center tw-space-x-2">
          <component :is="icon" class="tw-w-5 tw-h-5 tw-text-blue-500" />
          <h3
            class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white"
          >
            {{ title }}
          </h3>
        </div>
        <div class="tw-text-xs tw-text-gray-500 dark:tw-text-gray-400">
          {{ currentIndex + 1 }} / {{ totalCount }}
        </div>
      </div>

      <!-- Chart Container -->
      <div
        class="tw-relative tw-bg-gray-50 dark:tw-bg-gray-900 tw-rounded-lg tw-p-1"
      >
        <!-- 根据图表类型显示对应组件 -->
        <IndustryTypePie
          v-if="chartType === 'industry'"
          :width="chartWidth"
          :height="chartHeight"
        />
        <PayTypePie
          v-else-if="chartType === 'paytype'"
          :width="chartWidth"
          :height="chartHeight"
        />
        <AttributionPie
          v-else-if="chartType === 'attribution'"
          :width="chartWidth"
          :height="chartHeight"
        />
        <DailyLineChart
          v-else-if="chartType === 'daily'"
          :width="chartWidth"
          :height="chartHeight"
        />
        <MonthBar
          v-else-if="chartType === 'month'"
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
