<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <HeaderInfo />
      </el-header>

      <el-main>
        <el-row class="mb-4 chart-buttons">
          <el-button type="primary" plain @click="showChart(1, '日消费曲线')"
            >日消费曲线</el-button
          >
          <el-button type="warning" plain @click="showChart(2, '消费类型统计')"
            >消费类型统计</el-button
          >
          <el-button type="primary" plain @click="showChart(3, '消费日历')"
            >消费日历</el-button
          >
          <!-- <el-button type="info" round>Info</el-button>
          <el-button type="warning" round>Warning</el-button>
          <el-button type="danger" round>Danger</el-button> -->
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

      <el-footer>
        <p style="margin-top: 0px; margin-bottom: 0px">
          Powered by
          <a href="#" @click="openSource()">cashbook-desktop_v{{ version }}</a>
        </p>
        <p style="margin-top: 0px; margin-bottom: 0px">
          友链：<a href="#" @click="openOldmoon()">oldmoon.top</a>
        </p>
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
    </el-dialog>
  </div>
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
@media screen and (min-width: 960px) {
  body {
    margin: 0;
    padding: 0;
  }

  .el-main {
    padding-top: v-bind("tableDivStyle.paddingtop");
    padding-bottom: v-bind("tableDivStyle.paddingtop");
    float: left;
  }

  /* .el-main {
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: v-bing('mainRef.padding-left');
  padding-right: v-bing('mainRef.padding-right');
} */

  .mb-4 {
    margin: 10px;
    padding-left: v-bind("tableDivStyle.paddingleft");
    padding-right: v-bind("tableDivStyle.paddingright");
  }

  .table {
    float: none;
    padding-left: v-bind("tableDivStyle.paddingleft");
    padding-right: v-bind("tableDivStyle.paddingright");
  }

  .el-footer {
    box-align: center;
    text-align: center;
    height: v-bind("tableDivStyle.footer");
  }
}

@media screen and (max-width: 480px) {
  .el-header {
    height: 60px;
    padding: 5px;
  }

  .headerInfo {
    float: left;
  }

  .header-icon {
    width: 60px;
  }

  .themeButton {
    float: right;
    margin: 10px 10px;
  }

  .header-message {
    display: none;
  }

  .el-main {
    padding: 5px;
  }

  /* .mini-amin {
    width: 800px;
  } */

  .chart-buttons {
    display: flex;
    justify-content: center;
    align-items: center;  
  }

  .chart-buttons > .el-button {
    margin-top: 10px;
  }

  .el-footer {
    box-align: center;
    text-align: center;
    font-size: small;
  }
}
</style>
