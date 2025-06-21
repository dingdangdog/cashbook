<template>
  <div style="width: 100%">
    <v-tabs v-model="chartTab" align-tabs="center" color="green-accent-2">
      <v-tab :value="0">全部</v-tab>
      <v-tab :value="1">支出类型统计</v-tab>
      <v-tab :value="2">支付方式统计</v-tab>
      <v-tab :value="3">每日流水统计</v-tab>
      <v-tab :value="4">每月流水统计</v-tab>
      <v-tab :value="5">流水归属统计</v-tab>
    </v-tabs>

    <v-tabs-window v-model="chartTab">
      <v-tabs-window-item :value="0">
        <div class="chart-row">
          <IndustryTypePie
            :title="'支出类型统计'"
            :width="groupChartWidth"
            :height="groupChartHeigth"
            v-if="chartTab === 0"
          />
          <PayTypePie
            :title="'支付方式统计'"
            :width="groupChartWidth"
            :height="groupChartHeigth"
            v-if="chartTab === 0"
          />
        </div>
        <div class="chart-row">
          <DailyLineChart
            :title="'每日流水统计'"
            :width="groupChartWidth"
            :height="groupChartHeigth"
            v-if="chartTab === 0"
          />
          <MonthBar
            :title="'每月流水统计'"
            :width="groupChartWidth"
            :height="groupChartHeigth"
            v-if="chartTab === 0"
          />
        </div>
      </v-tabs-window-item>
      <v-tabs-window-item :value="1">
        <IndustryTypePie
          :title="''"
          :width="singleChartWidth"
          :height="singleChartHeight"
          v-if="chartTab === 1"
        />
      </v-tabs-window-item>
      <v-tabs-window-item :value="2">
        <PayTypePie
          :title="''"
          :width="singleChartWidth"
          :height="singleChartHeight"
          v-if="chartTab === 2"
        />
      </v-tabs-window-item>
      <v-tabs-window-item :value="3">
        <DailyLineChart
          :title="''"
          :width="singleChartWidth"
          :height="singleChartHeight"
          v-if="chartTab === 3"
        />
      </v-tabs-window-item>
      <v-tabs-window-item :value="4">
        <MonthBar
          :title="''"
          :width="singleChartWidth"
          :height="singleChartHeight"
          v-if="chartTab === 4"
        />
      </v-tabs-window-item>
      <v-tabs-window-item :value="5">
        <AttributionPie
          :title="''"
          :width="singleChartWidth"
          :height="singleChartHeight"
          v-if="chartTab === 5"
        />
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

// 借用全屏标志，用于判断时不是小屏模式
import { miniFullscreen } from "@/utils/common";
import { defineAsyncComponent, ref } from "vue";
import AttributionPie from "~/components/charts/AttributionPie.vue";
// 异步组件引用
const DailyLineChart = defineAsyncComponent(
  () => import("~/components/charts/DailyLineChart.vue")
);
const IndustryTypePie = defineAsyncComponent(
  () => import("~/components/charts/IndustryTypePie.vue")
);
const PayTypePie = defineAsyncComponent(
  () => import("~/components/charts/PayTypePie.vue")
);
const MonthBar = defineAsyncComponent(
  () => import("~/components/charts/MonthBar.vue")
);

const chartTab = ref(0);

const singleChartWidth = ref("80vw");
const singleChartHeight = ref("70vh");
const groupChartWidth = ref("40vw");
const groupChartHeigth = ref("40vh");

if (miniFullscreen()) {
  singleChartWidth.value = "100vw";
  singleChartHeight.value = "65vh";
  groupChartWidth.value = "95vw";
  groupChartHeigth.value = "65vh";
}
</script>

<style scoped>
.chart-row {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
</style>
