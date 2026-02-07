<template>
  <div class="chart-common-container">
    <div
      v-if="title || years.length > 0"
      class="relative w-full border-b border-border mb-2 h-12 md:mb-4"
    >
      <h4
        v-if="title"
        class="md:text-center text-lg font-semibold text-foreground my-2"
      >
        {{ title }}
      </h4>

      <div
        v-if="years.length > 0 || attributions.length > 0"
        class="flex gap-2 absolute right-0 top-0"
      >
        <select
          v-if="attributions.length > 0"
          v-model="filterAttribution"
          @change="filterAttributionChange"
          class="min-w-20 md:min-w-32 px-2 py-1 md:px-3 md:py-2 border border-border rounded-md shadow-md bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">全部归属</option>
          <option v-for="attr in attributions" :key="attr" :value="attr">
            {{ attr }}
          </option>
        </select>
        <select
          v-if="years.length > 0"
          v-model="filterYear"
          @change="filterYearChange"
          class="min-w-24 md:min-w-32 px-2 py-1 md:px-3 md:py-2 border border-border rounded-md shadow-md bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">全部年份</option>
          <option v-for="year in years" :key="year.value" :value="year.value">
            {{ year.title }}
          </option>
        </select>
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

  <!-- 流水表格对话框 -->
  <div
    v-if="showFlowTable"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click="showFlowTable = false"
  >
    <div
      class="w-full max-w-6xl max-h-[90vh] bg-surface rounded-lg shadow-xl overflow-hidden"
      @click.stop
    >
      <div
        class="flex justify-between items-center p-4 border-b border-border"
      >
        <h3 class="text-lg font-semibold text-foreground">
          流水详情
        </h3>
        <button
          @click="showFlowTable = false"
          class="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          关闭
        </button>
      </div>
      <div class="p-2 md:p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
        <DatasFlowTable :query="query" v-if="showFlowTable" :actions="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted, ref } from "vue";
import type { CommonChartData, CommonSelectOption } from "~/utils/model";

// 使用 props 来接收外部传入的参数
const { title, width, height } = defineProps(["title", "width", "height"]);

// 生成唯一ID避免冲突
const chartId = ref(`chartDiv-${Math.random().toString(36).substr(2, 9)}`);

const dataListOut: any[] = [];
const dataListIn: any[] = [];
const notInOut: any[] = [];
const xAxisList: any[] = [];
const noData = ref(false);

const years = ref<CommonSelectOption[]>([]);
const allData = ref<CommonChartData[]>([]);
const filterYear = ref("");
const attributions = ref<string[]>([]);
const filterAttribution = ref("");
const filterAttributionChange = () => {
  // 切换归属时重新查询数据
  doQuery();
};
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

const getAttributions = async () => {
  try {
    const res = await doApi.post<string[]>("api/entry/flow/getAttributions", {
      bookId: localStorage.getItem("bookId"),
    });
    attributions.value = res || [];
  } catch (error) {
    console.error("获取归属列表失败:", error);
    attributions.value = [];
  }
};

const doQuery = () => {
  const queryParams: any = {
    bookId: localStorage.getItem("bookId"),
  };
  if (filterAttribution.value) {
    queryParams.attribution = filterAttribution.value;
  }
  doApi
    .post<CommonChartData[]>("api/entry/analytics/month", queryParams)
    .then((res) => {
      if (res) {
        if (res.length === 0) {
          allData.value = [];
          // console.log("MonthBar未查询到数据！");
          noData.value = true;
          return;
        }
        // 重置所有数据数组
        years.value = [];
        allData.value = res;
        dataListOut.length = 0;
        dataListIn.length = 0;
        notInOut.length = 0;
        xAxisList.length = 0;

        const monthYears: string[] = [];

        // 根据年份过滤条件决定使用哪些数据
        let dataToProcess = res;
        if (filterYear.value) {
          dataToProcess = res.filter((d) => {
            return d.type.startsWith(filterYear.value);
          });
        }

        // 填充数据
        dataToProcess.forEach((data) => {
          monthYears.push(data.type.split("-")[0]);
          xAxisList.push(data.type);
          dataListOut.push(Number(data.outSum).toFixed(2));
          dataListIn.push(Number(data.inSum).toFixed(2));
          notInOut.push(Number(data.zeroSum).toFixed(2));
        });

        // 去重年份列表（基于全部数据，而不是过滤后的数据）
        const allMonthYears: string[] = [];
        res.forEach((data) => {
          allMonthYears.push(data.type.split("-")[0]);
        });
        const uniqueYears = Array.from(new Set(allMonthYears));
        uniqueYears.forEach((year) => {
          years.value.push({ title: year, value: year });
        });

        // 更新图表配置
        optionRef.value.series[0].data = dataListOut;
        optionRef.value.series[1].data = dataListIn;
        optionRef.value.series[2].data = notInOut;
        optionRef.value.xAxis.data = xAxisList;

        // 使用 notMerge: true 完全替换图表数据，而不是合并
        chart.setOption(optionRef.value, { notMerge: true });
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
  chartDiv = document.getElementById(chartId.value);
  const oldInstance = echarts.getInstanceByDom(chartDiv);
  if (oldInstance) {
    oldInstance.dispose();
  }
  chart = echarts.init(chartDiv);
  chart.on("click", function (param) {
    query.value.startDay = param.name + "-01";
    query.value.endDay = param.name + "-31";
    if (filterAttribution.value) {
      query.value.attribution = filterAttribution.value;
    }
    showFlowTable.value = true;
  });
  getAttributions();
  doQuery();
});
</script>

<style scoped>
.chart-content {
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

  .chart-content {
    font-size: small;
  }

  .chart-content > div > canvas {
    margin: 20px;
  }
}
</style>
