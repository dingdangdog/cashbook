<template>
  <div style="width: 100%">
    <v-tabs v-model="chartTab" align-tabs="center" color="green-accent-2">
      <v-tab :value="0">全部</v-tab>
      <v-tab :value="1">支出类型统计</v-tab>
      <v-tab :value="2">支付方式统计</v-tab>
      <v-tab :value="3">每日流水统计</v-tab>
      <v-tab :value="4">每月流水统计</v-tab>
    </v-tabs>

    <v-tabs-window v-model="chartTab">
      <v-tabs-window-item :value="0">
        <div class="chart-row">
          <TypePieChart :title="'支出类型统计'" :style="allChartStyle" v-if="chartTab === 0" />
          <PayTypeBar :title="'支付方式统计'" :style="allChartStyle" v-if="chartTab === 0" />
        </div>
        <div class="chart-row">
          <DailyLineChart :title="'每日流水统计'" :style="allChartStyle" v-if="chartTab === 0" />
          <MonthBar :title="'每月流水统计'" :style="allChartStyle" v-if="chartTab === 0" />
        </div>
      </v-tabs-window-item>
      <v-tabs-window-item :value="1">
        <TypePieChart :title="''" :style="singleChartStyle" v-if="chartTab === 1" />
      </v-tabs-window-item>
      <v-tabs-window-item :value="2">
        <PayTypeBar :title="''" :style="singleChartStyle" v-if="chartTab === 2" />
      </v-tabs-window-item>
      <v-tabs-window-item :value="3">
        <DailyLineChart :title="''" :style="singleChartStyle" v-if="chartTab === 3" />
      </v-tabs-window-item>
      <v-tabs-window-item :value="4">
        <MonthBar :title="''" :style="singleChartStyle" v-if="chartTab === 4" />
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
// 异步组件引用
const DailyLineChart = defineAsyncComponent(() => import('@/components/charts/DailyLineChart.vue'))
const TypePieChart = defineAsyncComponent(() => import('@/components/charts/TypePieChart.vue'))
const PayTypeBar = defineAsyncComponent(() => import('@/components/charts/PayTypeBar.vue'))
const MonthBar = defineAsyncComponent(() => import('@/components/charts/MonthBar.vue'))

const tabPosition = ref('left')
const chartTab = ref(0)

const singleChartStyle = ref('width: 80vw;height: 70vh;')
const allChartStyle = ref('width: 40vw;height: 33vh;')
</script>

<style scoped>
.chart-container {
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
}
.chart-row {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
</style>
