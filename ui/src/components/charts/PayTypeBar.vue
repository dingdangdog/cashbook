<template>
  <div class="chart-common-container">
    <v-navigation-drawer v-model="searchDrawer" temporary location="bottom">
      <div class="row-header">
        <div class="queryParam">
          <v-text-field
            label="开始时间"
            clearable
            v-model="chartParam.startDay"
            hide-details="auto"
            variant="outlined"
          ></v-text-field>
        </div>
        <div class="queryParam">
          <v-text-field
            label="结束时间"
            clearable
            v-model="chartParam.endDay"
            variant="outlined"
            hide-details="auto"
          ></v-text-field>
        </div>
      </div>
    </v-navigation-drawer>

    <h4 class="row-header">{{ title }}【{{ chartParam.flowType }}】</h4>

    <div id="payTypeDiv" :style="`width: ${width}; height: ${height};`">
      <h3 v-if="noData" style="width: 100%; text-align: center; color: tomato">暂无数据</h3>
    </div>

    <div class="row-header queryParam">
      <v-autocomplete
        label="流水类型"
        v-model="chartParam.flowType"
        :items="flowTypeOptions"
        hide-details="auto"
        variant="outlined"
      >
      </v-autocomplete>
      <v-btn class="btn-group-btn" color="primary" @click="searchDrawer = true">筛选 </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, ref, watch } from 'vue'
import { payTypeBar } from '@/api/api.analysis'
import type { TypePieChartQuery } from '@/model/analysis'
import { flowTableQuery, showFlowTableDialog } from '@/stores/flag'
import { useTheme } from 'vuetify'
import type { FlowQuery } from '@/model/flow'
import { miniFullscreen } from '@/utils/common'

const theme = useTheme()

const searchDrawer = ref(false)
// 使用 props 来接收外部传入的参数
const { title, width, height } = defineProps(['title', 'width', 'height'])

// 流水类型
const flowTypeOptions = ref<any[]>(['支出', '收入', '不计收支'])

const queryRef = ref<FlowQuery>({ pageNum: 1, pageSize: 20, flowType: '支出' })
const chartParam = ref<FlowQuery>({ flowType: '支出' })

const dataList: any[] = []
const noData = ref(false)

const optionRef = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    // top: '5%',
    // left: '0',
    // orient: 'vertical',
    textStyle: {
      color: '#fff'
    }
  },
  toolbox: {
    feature: {
      // 下载按钮
      // saveAsImage: {}
    }
  },
  series: [
    {
      name: '支付类型',
      type: 'pie',
      radius: ['50%', '80%'],
      // center: ['10%', '30%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 1
      },
      // grid: {
      //   left: '30',
      //   top: '20',
      //   right: '30',
      //   buttom: '20'
      // },
      label: {
        show: true,
        position: 'center',
        formatter(param: any) {
          // correct the percentage
          return param.name + ' (' + param.percent + '%)'
        }
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '40',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: dataList
    }
  ]
})

let payTypeDiv: any
let payTypeChart: echarts.ECharts

const doQuery = (query: TypePieChartQuery) => {
  payTypeBar(query).then((res) => {
    if (res) {
      if (res.length === 0) {
        console.log('PayTypeBar未查询到数据！')
        noData.value = true
        return
      }
      dataList.length = 0
      res.forEach((data) => {
        dataList.push({
          value: Number(data.typeSum).toFixed(2),
          name: data.type
        })
      })
      optionRef.value.series[0].data = dataList
      optionRef.value.legend.textStyle.color = theme.global.name.value == 'dark' ? '#fff' : '#000'
      optionRef.value.series[0].itemStyle.borderColor =
        theme.global.name.value == 'dark' ? '#fff' : '#000'

      payTypeDiv = document.getElementById('payTypeDiv')
      payTypeChart = echarts.init(payTypeDiv)
      payTypeChart.setOption(optionRef.value)
      payTypeChart.on('click', function (param) {
        queryRef.value.payType = param.name
        flowTableQuery.value = queryRef.value
        showFlowTableDialog.value = true
      })
    }
  })
}

watch(chartParam.value, () => {
  doQuery(chartParam.value)
})

onMounted(() => {
  if (miniFullscreen()) {
    // @ts-ignore
    optionRef.value.legend.top = '0'
  } else {
    // @ts-ignore
    optionRef.value.legend.left = '0'
    // @ts-ignore
    optionRef.value.legend.orient = 'vertical'
  }
  doQuery(chartParam.value)
})
</script>

<style scoped>
.row-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem;
}

#payTypeDiv {
  padding: 0.5rem;
}
</style>
