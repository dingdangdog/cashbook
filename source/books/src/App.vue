<template>
  <div class="common-layout">
    <el-container>

      <el-header>
        <div class="headerInfo header-icon">
          <img alt="oldmoon logo" class="logo"
            src="./static/images/cashbook.png"
            :width="icon.width" :height="icon.height" />
        </div>
        <div class="headerInfo header-title" text-algin="center">
          <h1>CashBook</h1>
        </div>
        <div class="themeButton">
          <el-button plain @click="toggleDark()">{{ isDark ? '⛅' : '🔆' }}
          </el-button>

          <el-button v-if="haveUserIdRef()" type="info" plain @click="clearUser()">关闭账本</el-button>
        </div>
        <div class="themeButton header-message">
          <b v-if="serverInfo.environment === 'personal'" style="color: red;">私人系统，无关人员请离开！</b>&nbsp;&nbsp;
          <b v-if="serverInfo.environment === 'demo'">演示系统，数据随时可能清除，请知晓！</b>&nbsp;&nbsp;
          <span v-if="haveUserIdRef()">当前账本：{{ bookName }}&nbsp;</span>
        </div>

      </el-header>

      <el-main>
        <span class="message">{{ system.message }}</span>
        <span class="message">{{ system.userInfo }}</span>
        <el-row class="mb-4 chart-buttons">
          <el-button round @click="showChart(1, '日消费曲线')">日消费曲线</el-button>
          <el-button type="primary" round @click="showChart(2, '消费类型统计')">消费类型统计</el-button>
          <el-button type="success" round @click="showChart(3, '消费日历')">消费日历</el-button>
          <el-button type="info" round>Info</el-button>
          <el-button type="warning" round>Warning</el-button>
          <el-button type="danger" round>Danger</el-button>
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
        <p style="margin-top: 0px; margin-bottom: 0px;">Powered by <a
            href="https://github.com/DingDangDog/cashbook-desktop">cashbook-desktop_v{{ serverInfo.version }}</a></p>
        <p style="margin-top: 0px; margin-bottom: 0px;">友链：<a href="https://oldmoon.top/about">oldmoon.top</a></p>
      </el-footer>

    </el-container>

    <el-dialog v-model="chartDialog.chartDiaLogShow" :title="chartDialog.chartDiaLogTitle" @close="closeDialog()"
      :fullscreen="miniScreen">
      <DailyLineChart v-if="(chartDialog.showChartNum == 1)" />
      <TypePieChart v-if="(chartDialog.showChartNum == 2)" />
      <CalendarChart v-if="(chartDialog.showChartNum == 3)" />
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToggle } from '@vueuse/shared';
import { clearUser } from './utils/setKey'
import { defineAsyncComponent } from 'vue'
import { getServerInfo } from './api/api.server';
import { chartDialog, isDark } from './utils/store';
// 异步组件引用
const FlowTable = defineAsyncComponent(() => import("./components/FlowTable.vue"));
const DailyLineChart = defineAsyncComponent(() => import("./components/DailyLineChart.vue"));
const TypePieChart = defineAsyncComponent(() => import("./components/TypePieChart.vue"));
const CalendarChart = defineAsyncComponent(() => import("./components/CalendarChart.vue"));

// 设置账本
const bookName = localStorage.getItem('bookName');
// 判断是否打开账本
const haveUserId = (): boolean => {
  if (bookName && 'none' !== bookName) {
    return true;
  } else {
    return false;
  }
}
const haveUserIdRef = ref(haveUserId);


const icon = ref({
  width: 60,
  height: 60,
})

if (document.body.clientWidth <= 480) {
  icon.value.width = 50;
  icon.value.height = 50;
}

const miniScreen = ref(false);
if (document.body.clientWidth <= 480) {
  miniScreen.value = true;
}

// 设置主题色
const toggleDark = useToggle(isDark);


// 修改展示图表的信息
const showChart = (showChartNum: number, chartDiaLogTitle: string) => {
  chartDialog.chartDiaLogShow = true;
  chartDialog.chartDiaLogTitle = chartDiaLogTitle;
  chartDialog.showChartNum = showChartNum;
}
// 关闭图表弹窗
const closeDialog = () => {
  chartDialog.chartDiaLogShow = false;
  chartDialog.showChartNum = 0;
}

// 动态表格样式
const tableDivStyle = ref({
  margintop: document.documentElement.clientHeight * 0.005 + `px`,
  paddingtop: document.documentElement.clientHeight * 0.02 + `px`,
  paddingbottom: document.documentElement.clientHeight * 0.01 + `px`,
  paddingleft: document.documentElement.clientWidth * 0.03 + `px`,
  paddingright: document.documentElement.clientWidth * 0.03 + `px`,
  header: document.documentElement.clientWidth * 0.02 + `px`,
  footer: document.documentElement.clientWidth * 0.02 + `px`
});
// 服务器信息封装
const serverInfo = ref({
  id: 1,
  version: '',
  environment: '',
  createDate: new Date(),
  startDate: new Date(),
});
// 获取服务器信息
getServerInfo().then(res => {
  serverInfo.value.id = res.id;
  serverInfo.value.version = res.version || '';
  serverInfo.value.environment = res.environment || '';
  serverInfo.value.createDate = res.createDate;

  if (serverInfo.value.environment === 'personal') {
    system.value.message = "私人系统，无关人员请离开！";
  } else {
    system.value.message = "演示系统，数据随时可能清除，请知晓！";
  }

  if (haveUserId()) {
    system.value.userInfo = "当前账本：" + bookName;
  }
})

const system = ref({
  message: "",
  userInfo: ""
})

</script>

<style scoped>
@media screen and (min-width: 960px) {

  .el-main {
    padding-top: v-bind('tableDivStyle.paddingtop');
    padding-bottom: v-bind('tableDivStyle.paddingtop');
    float: left;
  }

  .el-header {
    height: v-bind('tableDivStyle.header');
  }

  .headerInfo {
    margin-top: v-bind('tableDivStyle.margintop');
    margin-right: 20px;
    float: left;
    display: none;
  }

  .headerInfo>.h1 {
    margin-top: v-bind('tableDivStyle.margintop');
  }

  .themeButton {
    float: right;
    margin: 10px 5px;
  }

  .message {
    display: none;
  }

  /* .el-main {
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: v-bing('mainRef.padding-left');
  padding-right: v-bing('mainRef.padding-right');
} */

  .mb-4 {
    margin: 10px;
    padding-left: v-bind('tableDivStyle.paddingleft');
    padding-right: v-bind('tableDivStyle.paddingright');
  }

  .table {
    float: none;
    padding-left: v-bind('tableDivStyle.paddingleft');
    padding-right: v-bind('tableDivStyle.paddingright');
  }

  .el-footer {
    box-align: center;
    text-align: center;
    height: v-bind('tableDivStyle.footer');
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

  .chart-buttons>.el-button {
    margin-top: 10px;
  }

  .el-footer {
    box-align: center;
    text-align: center;
    font-size: small;
  }

}
</style>