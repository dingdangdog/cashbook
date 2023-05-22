<template>
  <el-container>
    <el-header>
      <HeaderInfo />
    </el-header>
    <hr/>
    <el-main>
      <el-row class="chart-buttons">
        <el-button type="warning" plain @click="showChart(2, '消费类型统计')">消费类型统计</el-button>
        <el-button type="warning" plain @click="showChart(4, '支付方式统计')">支付方式统计</el-button>
        <el-button type="primary" plain @click="showChart(1, '消费趋势')">消费趋势</el-button>
        <el-button type="primary" plain @click="showChart(3, '消费日历')">消费日历</el-button>
      </el-row>

      <div class="table">
        <Suspense>
          <template #default>
            <FlowTable />
          </template>
          <template #fallback>
            <div>加载中...</div>
          </template>
        </Suspense>
      </div>
    </el-main>

    <hr/>
    <el-footer>
      <span style="margin-top: 0px; margin-bottom: 0px">
        Powered by
        <a href="#" @click="openSource()">cashbook-desktop_v{{ version }}</a>
      </span>&nbsp;&nbsp;
      <span style="margin-top: 0px; margin-bottom: 0px">
        友链：<a href="#" @click="openOldmoon()">oldmoon.top</a>
      </span>
    </el-footer>
  </el-container>

  <el-dialog
    v-model="chartDialog.chartDiaLogShow"
    :title="chartDialog.chartDiaLogTitle"
    @close="closeDialog()"
    :fullscreen="miniScreen"
  >
    <DailyLineChart v-if="chartDialog.showChartNum == 1" />
    <TypePieChart v-if="chartDialog.showChartNum == 2" />
    <CalendarChart v-if="chartDialog.showChartNum == 3" />
    <PayTypeBar v-if="chartDialog.showChartNum == 4" />
  </el-dialog>
  
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineAsyncComponent } from "vue";
import { chartDialog } from "./utils/store";
// 异步组件引用
const FlowTable = defineAsyncComponent(
  () => import("./components/FlowTable.vue")
);
const DailyLineChart = defineAsyncComponent(
  () => import("./components/DailyLineChart.vue")
);
const TypePieChart = defineAsyncComponent(
  () => import("./components/TypePieChart.vue")
);
const CalendarChart = defineAsyncComponent(
  () => import("./components/CalendarChart.vue")
);
const PayTypeBar = defineAsyncComponent(
  () => import("./components/PayTypeBar.vue")
);
const HeaderInfo = defineAsyncComponent(
  () => import("./components/HeaderInfo.vue")
);

const miniScreen = ref(false);
if (document.body.clientWidth <= 480) {
  miniScreen.value = true;
}

const version = ref(localStorage.getItem("version"));

// 修改展示图表的信息
const showChart = (showChartNum: number, chartDiaLogTitle: string) => {
  chartDialog.chartDiaLogShow = true;
  chartDialog.chartDiaLogTitle = chartDiaLogTitle;
  chartDialog.showChartNum = showChartNum;
};
// 关闭图表弹窗
const closeDialog = () => {
  chartDialog.chartDiaLogShow = false;
  chartDialog.showChartNum = 0;
};

const openSource = () => {
  window.open("https://github.com/DingDangDog/cashbook-desktop");
};

const openOldmoon = () => {
  window.open("https://oldmoon.top");
};

// 动态表格样式
const tableDivStyle = ref({
  margintop: document.documentElement.clientHeight * 0.005 + `px`,
  paddingtop: document.documentElement.clientHeight * 0.02 + `px`,
  paddingbottom: document.documentElement.clientHeight * 0.01 + `px`,
  paddingleft: document.documentElement.clientWidth * 0.03 + `px`,
  paddingright: document.documentElement.clientWidth * 0.03 + `px`,
  header: document.documentElement.clientWidth * 0.02 + `px`,
  footer: document.documentElement.clientWidth * 0.02 + `px`,
});
</script>

<style scoped>
.el-container {
  margin: 0.2vh 0.5vw;
  width: 100%;
  max-width: 99vw;
  /* max-height: 99vh; */
  display: flex; /* 设置body为flex布局 */
  justify-content: center; /* 横向居中 */
  align-items: center; /* 纵向居中 */
}

.el-header {
  height: 8vh;
}

.el-main {
  height: 82vh;
  padding: 0.5rem;
}

.chart-buttons{
  
  display: flex; /* 设置body为flex布局 */
  justify-content: center; /* 横向居中 */
  align-items: center; /* 纵向居中 */
}

.table {
  height: 95%;
}

.el-footer {
  padding: 0.5rem;
  height: 4vh;
  box-align: center;
  text-align: center;
}

hr{
  width: 100%;
}
</style>
