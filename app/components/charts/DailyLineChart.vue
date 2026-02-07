<template>
  <div class="">
    <div
      class="w-full border-b border-gray-200 dark:border-gray-700 md:h-12 mb-4"
    >
      <div v-if="title">
        <h4
          class="text-lg text-center font-semibold text-foreground my-2"
        >
          {{ title }}
        </h4>
      </div>
    </div>
    <div v-show="noData" :style="`width: ${width}; height: ${height};`">
      <h3 style="width: 100%; text-align: center; color: tomato">暂无数据</h3>
    </div>
    <div
      v-show="!noData"
      :id="chartId"
      class="chart-content"
      :style="`width: ${width}; height: ${height};`"
    ></div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted, ref } from "vue";
import { dateFormater } from "@/utils/common";
import { daily } from "~/utils/apis";

// 使用 props 来接收外部传入的参数
const { title, width, height } = defineProps(["title", "width", "height"]);

// 生成唯一ID避免冲突
const chartId = ref(`lineDiv-${Math.random().toString(36).substr(2, 9)}`);

// 横轴数据
const xAxisList: string[] = [];
// 支出数据
const dataListOut: string[] = [];
// 收入数据
const dataListIn: string[] = [];
// 不计收支数据
const notInOut: string[] = [];
const noData = ref(false);

const optionRef = ref({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
    },
  },
  legend: {
    selected: {
      支出: true,
      收入: true,
      不计收支: false,
    },
    data: [
      {
        name: "支出",
        textStyle: {
          color: "rgb(217,159,8)",
        },
      },
      {
        name: "收入",
        textStyle: {
          color: "rgb(76, 152, 112)",
        },
      },
      {
        name: "不计收支",
        textStyle: {
          color: "rgb(66, 66, 66)",
        },
      },
    ], // 系列的名称，与 series 中的 name 对应
  },
  toolbox: {
    feature: {
      // 下载按钮
      // saveAsImage: {}
    },
  },
  dataZoom: [
    {
      type: "inside",
      start: 80,
      end: 100,
    },
    {
      start: 80,
      end: 100,
    },
    {
      start: 80,
      end: 100,
    },
  ],
  xAxis: {
    name: "日期",
    type: "category",
    data: xAxisList,
  },
  yAxis: {
    name: "金额(元)",
    show: true,
    type: "value",
    min: "0.00",
  },
  series: [
    {
      name: "支出",
      type: "line",
      symbol: "circle",
      symbolSize: 6,
      areaStyle: {},
      itemStyle: {
        color: "rgb(217,159,8)", // 支出颜色
      },
      emphasis: {
        focus: "series",
      },
      data: dataListOut,
    },
    {
      name: "收入",
      type: "line",
      symbol: "circle",
      symbolSize: 6,
      areaStyle: {},
      itemStyle: {
        color: "rgb(76, 152, 112)", // 收入颜色
      },
      emphasis: {
        focus: "series",
      },
      data: dataListIn,
    },
    {
      name: "不计收支",
      type: "line",
      symbol: "circle",
      visible: false,
      symbolSize: 6,
      areaStyle: {},
      itemStyle: {
        color: "rgb(66, 66, 66)", // 收入颜色
      },
      emphasis: {
        focus: "series",
      },
      data: notInOut,
    },
  ],
});

let lineDiv: any;
let lineChart: echarts.ECharts;

// 缩放比例动态计算，保证美观
const zoomChange = (total: number): number => {
  return (Math.ceil(total / 30) - 1) * 10;
};

onMounted(() => {
  lineDiv = document.getElementById(chartId.value);
  const oldInstance = echarts.getInstanceByDom(lineDiv);
  if (oldInstance) {
    oldInstance.dispose();
  }
  lineChart = echarts.init(lineDiv);
  daily({}).then((res) => {
    // console.log(res);
    if (res) {
      if (res && res.length == 0) {
        // console.log("DailyLineChart未查询到数据！");
        noData.value = true;
        return;
      }
      xAxisList.length = 0;
      dataListOut.length = 0;
      notInOut.length = 0;
      res.forEach((data) => {
        xAxisList.push(dateFormater("YYYY-MM-dd", data.type));
        dataListOut.push(Number(data.outSum).toFixed(2));
        dataListIn.push(Number(data.inSum).toFixed(2));
        notInOut.push(Number(data.zeroSum).toFixed(2));
      });
      optionRef.value.xAxis.data = xAxisList;
      optionRef.value.series[0].data = dataListOut;
      optionRef.value.series[1].data = dataListIn;
      optionRef.value.series[2].data = notInOut;
      optionRef.value.dataZoom[0].start = zoomChange(xAxisList.length);
      optionRef.value.dataZoom[1].start = zoomChange(xAxisList.length);
      optionRef.value.dataZoom[2].start = zoomChange(xAxisList.length);

      lineChart.setOption(optionRef.value);
    }
  });
});
</script>

<style scoped>
.chart-content {
  padding: 10px;
}

@media screen and (max-width: 480px) {
  .chart-content {
    font-size: small;
  }
}
</style>
