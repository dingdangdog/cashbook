<template>
  <el-tabs :tab-position="tabPosition" class="chart-container" v-model="activeTab">
    <el-tab-pane label="全部" name="all">
      <el-row justify="space-around" v-if="activeTab == 'all'">
        <el-col :span="11" class="chart-container">
          <DailyLineChart :title="'每日流水统计'" :style="allChartStyle" />
        </el-col>
        <el-col :span="11" class="chart-container">
          <MonthBar :title="'每月流水统计'" :style="allChartStyle" />
        </el-col>
      </el-row>

      <el-row justify="space-around" v-if="activeTab == 'all'">
        <el-col :span="11" class="chart-container">
          <PayTypeBar :title="'支付方式统计'" :style="allChartStyle" />
        </el-col>
        <el-col :span="11" class="chart-container">
          <TypePieChart :title="'支出类型统计'" :style="allChartStyle" />
        </el-col>
      </el-row>
    </el-tab-pane>
    <el-tab-pane label="支出类型统计" name="type">
      <TypePieChart v-if="activeTab == 'type'" :title="''" :style="singleChartStyle" />
    </el-tab-pane>
    <el-tab-pane label="支付方式统计" name="payType">
      <PayTypeBar v-if="activeTab == 'payType'" :title="''" :style="singleChartStyle" />
    </el-tab-pane>
    <el-tab-pane label="每日流水统计" name="dailyLine">
      <DailyLineChart v-if="activeTab == 'dailyLine'" :title="''" :style="singleChartStyle" />
    </el-tab-pane>
    <el-tab-pane label="每月流水统计" name="monthBar">
      <MonthBar v-if="activeTab == 'monthBar'" :title="''" :style="singleChartStyle" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
// 异步组件引用
const DailyLineChart = defineAsyncComponent(() => import('@/components/charts/DailyLineChart.vue'))
const TypePieChart = defineAsyncComponent(() => import('@/components/charts/TypePieChart.vue'))
const PayTypeBar = defineAsyncComponent(() => import('@/components/charts/PayTypeBar.vue'))
const MonthBar = defineAsyncComponent(() => import('@/components/charts/MonthBar.vue'))

const tabPosition = ref('left')
const activeTab = ref('all')

const singleChartStyle = ref('width: 80vw;height: 70vh;')
const allChartStyle = ref('width: 100%;height: 30vh;')
</script>

<style scoped>
.chart-container {
  padding: 0.5rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
}
</style>
