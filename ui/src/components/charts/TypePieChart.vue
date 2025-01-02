<template>
  <div class="chart-common-container">
    <v-navigation-drawer v-model="searchDrawer" temporary location="bottom">
      <div class="row-header">
        <div class="queryParam">
          <v-date-input
            label="开始日期"
            cancel-text="取消"
            ok-text="确定"
            clearable
            variant="outlined"
            hide-details="auto"
            v-model="startDay"
            :hide-actions="true"
            @update:modelValue="changeStartDay"
            @click:clear="clearStartDay"
          ></v-date-input>
        </div>
        <div class="queryParam">
          <v-date-input
            label="结束时间"
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

    <h4 class="row-header">{{ title }}【{{ chartParam.flowType }}】</h4>

    <div v-show="noData" :style="`width: ${width}; height: ${height};`">
      <h3 style="width: 100%; text-align: center; color: tomato">暂无数据</h3>
    </div>
    <div v-show="!noData" id="typePieDiv" :style="`width: ${width}; height: ${height};`"></div>

    <div class="row-header queryParam">
      <v-autocomplete
        label="流水类型"
        v-model="chartParam.flowType"
        :items="flowTypeOptions"
        hide-details="auto"
        variant="outlined"
      >
      </v-autocomplete>
      <v-btn class="btn-group-btn" color="primary" @click="searchDrawer = true">时间筛选</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VDateInput } from 'vuetify/labs/VDateInput'
import * as echarts from 'echarts'
import { flowTableQuery } from '@/stores/flag'
import { onMounted, ref, watch } from 'vue'
import { typePie } from '@/api/api.analysis'
import type { TypePieChartQuery } from '@/model/analysis'
import { showFlowTableDialog } from '@/stores/flag'
import { useTheme } from 'vuetify'
import type { FlowQuery } from '@/model/flow'
import { dateFormater, miniFullscreen } from '@/utils/common'

const theme = useTheme()

// 使用 props 来接收外部传入的参数
const { title, width, height } = defineProps(['title', 'width', 'height'])

const searchDrawer = ref(false)

// 流水类型
const flowTypeOptions = ref<any[]>(['支出', '收入', '不计收支'])

const queryRef = ref<FlowQuery>({ pageNum: 1, pageSize: 20, flowType: '支出' })
const chartParam = ref<FlowQuery>({ flowType: '支出' })

const dataList: any[] = []
const noData = ref(false)

const startDay = ref()
const endDay = ref()
const changeStartDay = () => {
  if (startDay.value) {
    // console.log(startDay.value)
    chartParam.value.startDay = dateFormater('YYYY-MM-dd', startDay.value)
  } else {
    chartParam.value.startDay = ''
  }
}
const clearStartDay = () => {
  startDay.value = null
  chartParam.value.startDay = ''
}
const changeEndDay = () => {
  if (endDay.value) {
    // console.log(endDay.value)
    chartParam.value.endDay = dateFormater('YYYY-MM-dd', endDay.value)
  } else {
    chartParam.value.endDay = ''
  }
}
const clearEndDay = () => {
  endDay.value = null
  chartParam.value.endDay = ''
}

const optionRef = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    // top: 'bottom',
    // left: '0',
    // orient: 'vertical', // 图例的排列方向
    textStyle: {
      color: '#fff' // 图例文字颜色
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
      name: '消费类型',
      type: 'pie',
      radius: ['50%', '80%'], // 饼图的半径，数组的第一项是内半径，第二项是外半径
      // center: ['10%', '30%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10, // 饼图扇形的边框弧度
        borderColor: '#fff', // 饼图扇形的边框颜色
        borderWidth: 1 // 饼图扇形的边框线宽
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

let typePieDiv: any
let typePieChart: echarts.ECharts

const doQuery = (query: TypePieChartQuery) => {
  typePie(query).then((res) => {
    if (res) {
      if (res.length === 0) {
        console.log('TypePieChart未查询到数据！')
        noData.value = true
        return
      } else {
        noData.value = false
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
      typePieChart.setOption(optionRef.value)
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

  typePieDiv = document.getElementById('typePieDiv')
  typePieChart = echarts.init(typePieDiv)
  typePieChart.on('click', function (param) {
    queryRef.value.type = param.name
    flowTableQuery.value = queryRef.value
    showFlowTableDialog.value = true
  })
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

#typePieDiv {
  padding: 0.5rem;
}
</style>
