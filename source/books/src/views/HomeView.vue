<template>
  <el-row justify="space-around">
    <el-col :span="11" class="chart-container">
      <DailyLineChart />
    </el-col>
    <el-col :span="11" class="chart-container">
      <MonthBar />
    </el-col>
  </el-row>

  <el-row justify="space-around">
    <el-col :span="11" class="chart-container">
      <TypePieChart />
    </el-col>
    <el-col :span="11" class="chart-container">
      <PayTypeBar />
    </el-col>
  </el-row>

  <!-- <CalendarChart v-if="chartDialog.showChartNum == 3" /> -->
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
// 异步组件引用
const DailyLineChart = defineAsyncComponent(() => import('@/components/DailyLineChart.vue'))
const TypePieChart = defineAsyncComponent(() => import('@/components/TypePieChart.vue'))
const PayTypeBar = defineAsyncComponent(() => import('@/components/PayTypeBar.vue'))
const MonthBar = defineAsyncComponent(() => import('@/components/MonthBar.vue'))
</script>

<style scoped>
.chart-container {
  padding: 2rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
}
</style>
