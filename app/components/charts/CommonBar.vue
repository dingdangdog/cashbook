<template>
  <div class="w-full">
    <div class="md:h-16 mb-2 relative">
      <h4
        class="hidden md:block text-center font-semibold text-foreground my-2"
      >
        {{ title }}
      </h4>
      <span
        class="absolute left-0 top-0 text-xs text-primary-500 dark:text-primary-400 hover:text-primary-600 cursor-pointer rounded-md shadow-sm transition-colors"
        @click="toggleLegend()"
      >
        {{ showLegend ? "隐藏图例" : "显示图例" }}
      </span>
    </div>

    <div
      v-show="noData"
      :style="`width: ${width}; height: ${height};`"
      class="flex items-center justify-center"
    >
      <h3 class="text-lg text-red-500 font-medium">暂无数据</h3>
    </div>
    <div
      v-show="!noData"
      :id="chartId"
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
      class="w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
      @click.stop
    >
      <div
        class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700"
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
import { onMounted, ref, watch } from "vue";
import { dateFormater, miniFullscreen } from "@/utils/common";
import { doApi } from "@/utils/api";
import type { CommonChartData, CommonChartQuery } from "~/utils/model";
import DatasFlowTable from "@/components/datas/FlowTable.vue";

const { isDark } = useAppTheme();

// 定义组件的props
interface Props {
  title: string;
  width: string;
  height: string;
  groupBy: string; // 分组字段 (payType/industryType/attribution)
  startDay?: string;
  endDay?: string;
  flowType?: string;
  seriesName?: string; // 系列名称
  showLegend?: boolean; // 是否显示图例
  queryField?: string; // 点击时传递给FlowTable的查询字段名
}

const props = withDefaults(defineProps<Props>(), {
  seriesName: "数据分析",
  showLegend: true,
  queryField: "payType", // 默认为payType，保持向下兼容
});

// 生成唯一ID避免冲突
const chartId = ref(`commonBarDiv-${Math.random().toString(36).substr(2, 9)}`);

const chartParam = ref<CommonChartQuery & { groupBy: string }>({
  startDay: props.startDay,
  endDay: props.endDay,
  flowType: props.flowType,
  groupBy: props.groupBy,
});

const dataList: any[] = [];
const xAxisData: string[] = [];
const noData = ref(false);

const optionRef = ref({
  tooltip: {
    trigger: "item", // 改为item触发，每个柱子独立
  },
  legend: {
    show: props.showLegend, // 根据props控制图例显示
    data: xAxisData, // 图例对应每个x轴数据项
    textStyle: {
      color: "#374151",
    },
  },
  toolbox: {
    feature: {
      // 下载按钮
      // saveAsImage: {}
    },
  },
  xAxis: {
    type: "category",
    data: xAxisData,
    axisLabel: {
      rotate: 45, // 标签旋转45度，防止重叠
      fontSize: 12,
    },
  },
  yAxis: {
    type: "value",
    name: "金额(元)",
  },
  series: [
    {
      name: props.seriesName,
      type: "bar",
      data: dataList, // 这里的数据需要包含name属性
      itemStyle: {
        color: "rgba(217,159,8, 0.9)", // 默认黄色（支出色）
        borderRadius: [4, 4, 0, 0], // 顶部圆角
      },
      label: {
        show: true,
        position: "top",
        fontSize: 12,
        formatter: function (params: any) {
          return Number(params.value).toFixed(2);
        },
      },
      emphasis: {
        itemStyle: {
          color: "rgba(217,159,8, 1)", // 悬停时的颜色
        },
      },
    },
  ],
});

let chartDiv: any;
let chart: echarts.ECharts;

const doQuery = (query: CommonChartQuery & { groupBy: string }) => {
  doApi
    .post<CommonChartData[]>("api/entry/analytics/common", {
      bookId: localStorage.getItem("bookId"),
      ...query,
    })
    .then((res) => {
      if (res) {
        if (res.length === 0) {
          noData.value = true;
          return;
        } else {
          noData.value = false;
        }

        // 清空数据
        dataList.length = 0;
        xAxisData.length = 0;

        if (query.flowType == "支出") {
          // 先排序
          res.sort((a, b) => Number(b.outSum) - Number(a.outSum));
          res.forEach((data) => {
            xAxisData.push(data.type);
            dataList.push({
              name: data.type,
              value: Number(data.outSum).toFixed(2),
            });
          });
        } else if (query.flowType == "收入") {
          // 先排序
          res.sort((a, b) => Number(b.inSum) - Number(a.inSum));
          res.forEach((data) => {
            xAxisData.push(data.type);
            dataList.push({
              name: data.type,
              value: Number(data.inSum).toFixed(2),
            });
          });
        } else {
          // 先排序
          res.sort((a, b) => Number(b.zeroSum) - Number(a.zeroSum));
          res.forEach((data) => {
            xAxisData.push(data.type);
            dataList.push({
              name: data.type,
              value: Number(data.zeroSum).toFixed(2),
            });
          });
        }

        // 重新渲染图表
        optionRef.value.xAxis.data = xAxisData;
        optionRef.value.series[0].data = dataList;
        optionRef.value.legend.data = xAxisData; // 更新图例数据
        optionRef.value.legend.textStyle.color = isDark.value
          ? "#e5e7eb"
          : "#374151";

        // 根据流水类型设置不同颜色，参考MonthBar.vue
        if (query.flowType == "支出") {
          optionRef.value.series[0].itemStyle.color = "rgba(217,159,8, 0.9)"; // 黄色
          optionRef.value.series[0].emphasis.itemStyle.color =
            "rgba(217,159,8, 1)";
        } else if (query.flowType == "收入") {
          optionRef.value.series[0].itemStyle.color = "rgba(76, 152, 112, 0.9)"; // 绿色
          optionRef.value.series[0].emphasis.itemStyle.color =
            "rgba(76, 152, 112, 1)";
        } else {
          optionRef.value.series[0].itemStyle.color = "rgba(66, 66, 66, 0.9)"; // 灰色
          optionRef.value.series[0].emphasis.itemStyle.color =
            "rgba(66, 66, 66, 1)";
        }

        // 确保图表完全重新渲染
        chart.clear();
        chart.setOption(optionRef.value);
      }
    });
};

const showLegend = ref(props.showLegend);

const toggleLegend = () => {
  showLegend.value = !showLegend.value;
};

watch(showLegend, () => {
  optionRef.value.legend.show = showLegend.value;
  chart.setOption(optionRef.value);
});

// 监听 props 变化，更新 chartParam
watch(
  () => [props.startDay, props.endDay],
  ([newStartDay, newEndDay]) => {
    chartParam.value.startDay = newStartDay;
    chartParam.value.endDay = newEndDay;
  }
);

watch(
  chartParam,
  () => {
    doQuery(chartParam.value);
  },
  { deep: true }
);

const query = ref();
const showFlowTable = ref(false);

onMounted(() => {
  // 根据图例显示设置调整布局
  if (!props.showLegend) {
    // 不显示图例时，可以给图表更多空间
    optionRef.value.legend.show = false;
  }

  chartDiv = document.getElementById(chartId.value);
  const oldInstance = echarts.getInstanceByDom(chartDiv);
  if (oldInstance) {
    oldInstance.dispose();
  }
  chart = echarts.init(chartDiv);
  chart.on("click", function (param: any) {
    // 根据queryField动态设置查询参数
    const itemName = param.name || (param.data && param.data.name) || "";
    query.value = {
      ...chartParam.value,
      [props.queryField]: itemName,
    };
    showFlowTable.value = true;
  });
  doQuery(chartParam.value);
});
</script>

<style scoped></style>
