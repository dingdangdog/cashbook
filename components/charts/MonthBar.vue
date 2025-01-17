<template>
  <div class="chart-common-container">
    <div
      class="tw-flex tw-justify-between tw-items-center tw-w-full tw-border-b tw-h-16"
    >
      <div>
        <h4 class="tw-text-lg my-2">{{ title }}</h4>
      </div>

      <div class="tw-min-w-32">
        <v-select
          v-model="filterYear"
          :items="years"
          label="年份筛选"
          hide-details="auto"
          clearable
          variant="outlined"
          @update:model-value="filterYearChange"
        ></v-select>
      </div>
    </div>
    <div v-show="noData" :style="`width: ${width}; height: ${height};`">
      <h3 style="width: 100%; text-align: center; color: tomato">暂无数据</h3>
    </div>
    <div
      v-show="!noData"
      id="chartDiv"
      :style="`width: ${width}; height: ${height};`"
    ></div>
  </div>

  <v-dialog :width="'80vw'" v-model="showFlowTable">
    <v-card>
      <v-card-title>
        <div class="tw-flex tw-justify-end">
          <div>
            <v-btn
              color="error"
              variant="elevated"
              @click="showFlowTable = false"
            >
              关闭
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <DataFlowTable :query="query" v-if="showFlowTable" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted, ref } from "vue";
import type { CommonChartData, CommonSelectOption } from "~/utils/model";

// 使用 props 来接收外部传入的参数
const { title, width, height } = defineProps(["title", "width", "height"]);

const dataListOut: any[] = [];
const dataListIn: any[] = [];
const notInOut: any[] = [];
const xAxisList: any[] = [];
const noData = ref(false);

const years = ref<CommonSelectOption[]>([]);
const allData = ref<CommonChartData[]>([]);
const filterYear = ref();
const filterYearChange = () => {
  dataListOut.length = 0;
  dataListIn.length = 0;
  notInOut.length = 0;
  xAxisList.length = 0;

  let data = [];
  // console.log("filterYear.value:", filterYear.value);
  // console.log("allData.value", allData.value);
  if (filterYear.value) {
    data = allData.value.filter((d) => {
      return d.type.startsWith(filterYear.value);
    });
  } else {
    data = allData.value;
  }

  data.forEach((data) => {
    xAxisList.push(data.type);
    dataListOut.push(Number(data.outSum).toFixed(2));
    dataListIn.push(Number(data.inSum).toFixed(2));
    notInOut.push(Number(data.zeroSum).toFixed(2));
  });

  optionRef.value.series[0].data = dataListOut;
  optionRef.value.series[1].data = dataListIn;
  optionRef.value.series[2].data = notInOut;
  optionRef.value.xAxis.data = xAxisList;

  chart.setOption(optionRef.value);
};

const optionRef = ref({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },

  toolbox: {
    feature: {
      // 下载按钮
      // saveAsImage: {}
    },
  },
  xAxis: {
    name: "年月",
    type: "category",
    data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月"],
  },
  yAxis: {
    name: "金额(元)",
    type: "value",
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
          color: "rgba(217,159,8, 0.9)",
        },
      },
      {
        name: "收入",
        textStyle: {
          color: "rgba(76, 152, 112, 0.9)",
        },
      },
      {
        name: "不计收支",
        textStyle: {
          color: "rgba(66, 66, 66, 0.9)",
        },
      },
    ], // 系列的名称，与 series 中的 name 对应
  },
  series: [
    {
      name: "支出",
      data: [120, 200, 150, 80, 70, 110, 130],
      type: "bar",
      itemStyle: {
        color: "rgba(217,159,8, 0.9)",
      },
      label: {
        show: true,
        position: "top",
        fontSize: 14,
        color: "rgba(217,159,8, 0.9)",
      },
    },
    {
      name: "收入",
      data: [120, 200, 150, 80, 70, 110, 130],
      type: "bar",
      itemStyle: {
        color: "rgba(76, 152, 112, 0.9)",
      },
      label: {
        show: true,
        position: "top",
        fontSize: 14,
        color: "rgba(76, 152, 112, 0.9)",
      },
    },
    {
      name: "不计收支",
      data: [120, 200, 150, 80, 70, 110, 130],
      type: "bar",
      itemStyle: {
        color: "rgba(66, 66, 66, 0.9)",
      },
      label: {
        show: true,
        position: "top",
        fontSize: 14,
        color: "rgba(66, 66, 66, 0.9)",
      },
    },
  ],
});

let chartDiv: any;
let chart: echarts.ECharts;

const query = ref<FlowQuery>({ pageNum: 1, pageSize: 20 });
const showFlowTable = ref(false);

const doQuery = () => {
  doApi
    .post<CommonChartData[]>("api/entry/analytics/month", {
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      if (res) {
        if (res.length === 0) {
          allData.value = [];
          // console.log("MonthBar未查询到数据！");
          noData.value = true;
          return;
        }
        years.value = [];
        allData.value = res;
        dataListOut.length = 0;
        dataListIn.length = 0;
        notInOut.length = 0;
        const monthYears: string[] = [];
        res.forEach((data) => {
          monthYears.push(data.type.split("-")[0]);
          xAxisList.push(data.type);
          dataListOut.push(Number(data.outSum).toFixed(2));
          dataListIn.push(Number(data.inSum).toFixed(2));
          notInOut.push(Number(data.zeroSum).toFixed(2));
        });

        // 去重
        const uniqueYears = Array.from(new Set(monthYears));
        uniqueYears.forEach((year) => {
          years.value.push({ title: year, value: year });
        });

        optionRef.value.series[0].data = dataListOut;
        optionRef.value.series[1].data = dataListIn;
        optionRef.value.series[2].data = notInOut;
        optionRef.value.xAxis.data = xAxisList;

        chart.setOption(optionRef.value);
      }
    });
};

/**
 * 生成16进制随机颜色
 */
// const getRandomColor = () => {
//   var letters = '6789ABCDEF'
//   var color = '#'
//   for (var i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 10)]
//   }
//   return color
// }

onMounted(() => {
  chartDiv = document.getElementById("chartDiv");
  chart = echarts.init(chartDiv);
  chart.on("click", function (param) {
    query.value.startDay = param.name + "-01";
    query.value.endDay = param.name + "-31";
    showFlowTable.value = true;
  });
  doQuery();
});
</script>

<style scoped>
#chartDiv {
  padding: 10px;
}

@media screen and (min-width: 960px) {
  .mini-buttons {
    display: none;
  }
}

@media screen and (max-width: 480px) {
  .pc-button {
    display: none;
  }

  .mini-buttons {
    margin: 8px 3px;
  }

  #chartDiv {
    font-size: small;
  }

  #chartDiv > div > canvas {
    margin: 20px;
  }
}
</style>
