<template>
  <div class="chart-common-container">
    <v-navigation-drawer v-model="searchDrawer" temporary location="right">
      <div class="tw-p-2">
        <div class="queryParam">
          <v-date-input
            label="开始日期"
            cancel-text="取消"
            ok-text="确定"
            clearable
            variant="outlined"
            hide-details="auto"
            :hide-actions="true"
            v-model="startDay"
            @update:modelValue="changeStartDay"
            @click:clear="clearStartDay"
          ></v-date-input>
        </div>
        <div class="queryParam">
          <v-date-input
            label="结束日期"
            cancel-text="取消"
            ok-text="确定"
            variant="outlined"
            hide-details="auto"
            v-model="endDay"
            clearable
            :hide-actions="true"
            @update:modelValue="changeEndDay"
            @click:clear="clearEndDay"
          ></v-date-input>
        </div>
      </div>
    </v-navigation-drawer>

    <div
      class="tw-flex tw-flex-col md:tw-flex-row md:tw-justify-between tw-items-center tw-w-full tw-border-b md:tw-h-16"
    >
      <div class="">
        <h4 class="tw-text-lg my-2">
          {{ title }}【{{ chartParam.flowType }}】
        </h4>
      </div>

      <div class="tw-flex tw-space-x-2 tw-items-center">
        <v-btn color="primary" @click="searchDrawer = true">时间筛选 </v-btn>
        <div class="tw-min-w-32">
          <v-autocomplete
            v-model="chartParam.flowType"
            :items="FlowTypes"
            hide-details="auto"
            variant="outlined"
          >
          </v-autocomplete>
        </div>
      </div>
    </div>
    <div v-show="noData" :style="`width: ${width}; height: ${height};`">
      <h3 style="width: 100%; text-align: center; color: tomato">暂无数据</h3>
    </div>
    <div
      v-show="!noData"
      id="payTypeDiv"
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
        <DatasFlowTable :query="query" v-if="showFlowTable" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { VDateInput } from "vuetify/labs/VDateInput";
import * as echarts from "echarts";
import { onMounted, ref, watch } from "vue";
import { useTheme } from "vuetify";
import { dateFormater, miniFullscreen } from "@/utils/common";
import type { CommonChartData, CommonChartQuery } from "~/utils/model";

const theme = useTheme();

const searchDrawer = ref(false);
// 使用 props 来接收外部传入的参数
const { title, width, height } = defineProps(["title", "width", "height"]);

const chartParam = ref<CommonChartQuery>({ flowType: "支出" });

const dataList: any[] = [];
const noData = ref(false);

const startDay = ref();
const endDay = ref();
const changeStartDay = () => {
  if (startDay.value) {
    // console.log(startDay.value)
    chartParam.value.startDay = dateFormater("YYYY-MM-dd", startDay.value);
  } else {
    chartParam.value.startDay = "";
  }
};
const clearStartDay = () => {
  startDay.value = null;
  chartParam.value.startDay = "";
};
const changeEndDay = () => {
  if (endDay.value) {
    // console.log(endDay.value)
    chartParam.value.endDay = dateFormater("YYYY-MM-dd", endDay.value);
  } else {
    chartParam.value.endDay = "";
  }
};
const clearEndDay = () => {
  endDay.value = null;
  chartParam.value.endDay = "";
};

const optionRef = ref({
  tooltip: {
    trigger: "item",
  },
  legend: {
    tooltip: {
      // trigger: "item",
      formatter: function (legend: any) {
        // {componentType: 'legend', name: '其他网购', $vars: Array(1), legendIndex: 0}
        // 找到对应的类型，显示数值
        for (let d of dataList) {
          if (legend.name == d.name) {
            // console.log(d);
            return `${legend.name}: ${d.value}`;
          }
        }
        // console.log(legend);
        return `未找到${legend.name}`;
        // return echarts.format.truncateText(
        //   name,
        //   40,
        //   "14px Microsoft Yahei",
        //   "…"
        // );
      },
      show: true,
    },
    textStyle: {
      color: "#fff",
    },
  },
  toolbox: {
    feature: {
      // 下载按钮
      // saveAsImage: {}
    },
  },
  series: [
    {
      name: "支付类型",
      type: "pie",
      radius: ["50%", "80%"],
      // center: ['10%', '30%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 1,
      },
      // grid: {
      //   left: '30',
      //   top: '20',
      //   right: '30',
      //   buttom: '20'
      // },
      label: {
        show: true,
        position: "center",
        formatter(param: any) {
          // correct the percentage
          return param.name + " (" + param.percent + "%)";
        },
      },
      emphasis: {
        label: {
          show: true,
          fontSize: "40",
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: dataList,
    },
  ],
});

let payTypeDiv: any;
let payTypeChart: echarts.ECharts;

const doQuery = (query: CommonChartQuery) => {
  doApi
    .post<CommonChartData[]>("api/entry/analytics/payType", {
      bookId: localStorage.getItem("bookId"),
      ...query,
    })
    .then((res) => {
      if (res) {
        if (res.length === 0) {
          // console.log("PayTypeBar未查询到数据！");
          noData.value = true;
          return;
        } else {
          noData.value = false;
        }
        dataList.length = 0;
        if (query.flowType == "支出") {
          // 先排序
          res.sort((a, b) => Number(b.outSum) - Number(a.outSum));
          res.forEach((data) => {
            dataList.push({
              value: Number(data.outSum).toFixed(2),
              name: data.type,
            });
          });
        } else if (query.flowType == "收入") {
          // 先排序
          res.sort((a, b) => Number(b.inSum) - Number(a.inSum));
          res.forEach((data) => {
            dataList.push({
              value: Number(data.inSum).toFixed(2),
              name: data.type,
            });
          });
        } else {
          // 先排序
          res.sort((a, b) => Number(b.zeroSum) - Number(a.zeroSum));
          res.forEach((data) => {
            dataList.push({
              value: Number(data.zeroSum).toFixed(2),
              name: data.type,
            });
          });
        }

        optionRef.value.series[0].data = dataList;
        optionRef.value.legend.textStyle.color =
          theme.global.name.value == "dark" ? "#fff" : "#000";
        optionRef.value.series[0].itemStyle.borderColor =
          theme.global.name.value == "dark" ? "#fff" : "#000";

        payTypeChart.setOption(optionRef.value);
      }
    });
};

watch(chartParam.value, () => {
  doQuery(chartParam.value);
});

const query = ref();
const showFlowTable = ref(false);

onMounted(() => {
  if (miniFullscreen()) {
    // @ts-ignore
    optionRef.value.legend.top = "0";
  } else {
    // @ts-ignore
    optionRef.value.legend.left = "0";
    // @ts-ignore
    optionRef.value.legend.orient = "vertical";
  }

  payTypeDiv = document.getElementById("payTypeDiv");
  payTypeChart = echarts.init(payTypeDiv);
  payTypeChart.on("click", function (param) {
    query.value = { ...chartParam.value, payType: param.name };
    showFlowTable.value = true;
  });
  doQuery(chartParam.value);
});
</script>

<style scoped>
#payTypeDiv {
  padding: 0.5rem;
}
</style>
