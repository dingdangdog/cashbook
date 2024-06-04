<template>
  <el-tabs :tab-position="tabPosition" class="chart-container">
<!--    <el-tab-pane label="全部">-->
<!--      <el-row justify="space-around">-->
<!--        <el-col :span="11" class="chart-container">-->
<!--          <DailyLineChart :title="'每日流水统计'" :style="allChartStyle" />-->
<!--        </el-col>-->
<!--        <el-col :span="11" class="chart-container">-->
<!--          <MonthBar :title="'每月流水统计'" :style="allChartStyle" />-->
<!--        </el-col>-->
<!--      </el-row>-->

<!--      <el-row justify="space-around">-->
<!--        <el-col :span="11" class="chart-container">-->
<!--          <TypePieChart :title="'支出类型统计'" :style="allChartStyle" />-->
<!--        </el-col>-->
<!--        <el-col :span="11" class="chart-container">-->
<!--          <PayTypeBar :title="'支付方式统计'" :style="allChartStyle" />-->
<!--        </el-col>-->
<!--      </el-row>-->
<!--    </el-tab-pane>-->
    <el-tab-pane label="支出类型统计">
      <TypePieChart :title="''" :style="singleChartStyle" />
    </el-tab-pane>
    <el-tab-pane label="支付方式统计">
      <PayTypeBar :title="''" :style="singleChartStyle"/>
    </el-tab-pane>
    <el-tab-pane label="每日流水统计">
      <DailyLineChart :title="''" :style="singleChartStyle"/>
    </el-tab-pane>
    <el-tab-pane label="每月流水统计">
      <MonthBar :title="''" :style="singleChartStyle"/>
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

const singleChartStyle = ref('width: 80vw;height: 70vh;')
const allChartStyle = ref('width: 100%;height: 30vh;')
</script>

<style scoped>
.chart-container {
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
}
</style>
