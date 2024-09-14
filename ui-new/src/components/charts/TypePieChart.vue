<template>
  <div class="chart-common-container">
    <h4 class="row-header">{{ title }}【{{ queryRef.flowType }}】</h4>
    <div style="display: flex; justify-content: center">
      <div class="row-header queryParam">
        <v-text-field
          label="开始时间"
          clearable
          v-model="queryRef.startDay"
          hide-details="auto"
          variant="outlined"
        ></v-text-field>
        <!-- <v-date-picker
            v-model="queryRef.startDay"
            type="date"
            style="width: auto"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            placeholder="开始时间"
          ></v-date-picker> -->
      </div>
      <div class="row-header queryParam">
        <v-text-field
          label="结束时间"
          clearable
          v-model="queryRef.endDay"
          variant="outlined"
          hide-details="auto"
        ></v-text-field>
      </div>
      <div class="row-header queryParam">
        <v-autocomplete
          label="流水类型"
          clearable
          v-model="queryRef.flowType"
          :items="flowTypeOptions"
          hide-details="auto"
          variant="outlined"
        >
        </v-autocomplete>
      </div>
    </div>
    <div id="typePieDiv" :style="style"></div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, ref, watch } from 'vue'
import { typePie } from '@/api/api.analysis'
import { flowQuery, resetFlowQuery } from '@/utils/store'
import type { TypePieChartQuery } from '@/model/analysis'
import { showFlowTableDialog } from '@/stores/flag'
import { useTheme } from 'vuetify'

const theme = useTheme()

// 使用 props 来接收外部传入的参数
const { title, style } = defineProps(['title', 'style'])

const query: TypePieChartQuery = {
  flowType: '支出'
}
// 流水类型
const flowTypeOptions = ref<any[]>(['支出', '收入', '不计收支'])

const queryRef = ref(query)

const dataList: any[] = []

const optionRef = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: '0',
    orient: 'vertical',
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
      name: '消费类型',
      type: 'pie',
      radius: ['60%', '80%'],
      // center: ['10%', '30%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
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
  flowQuery.value.startDay = queryRef.value.startDay
  flowQuery.value.endDay = queryRef.value.endDay
  typePie(query).then((res) => {
    if (res) {
      if (res.length === 0) {
        console.log('TypePieChart未查询到数据！')
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

      if (document.body.clientWidth <= 480) {
        optionRef.value.series[0].radius = ['30%', '50%']
      }

      typePieDiv = document.getElementById('typePieDiv')
      typePieChart = echarts.init(typePieDiv)
      typePieChart.setOption(optionRef.value)
      typePieChart.on('click', function (param) {
        resetFlowQuery()
        flowQuery.value.startDay = queryRef.value.startDay
        flowQuery.value.endDay = queryRef.value.endDay
        flowQuery.value.type = param.name
        flowQuery.value.flowType = queryRef.value.flowType
        showFlowTableDialog.value.visible = true
      })
    }
  })
}
watch(queryRef.value, () => {
  doQuery(queryRef.value)
})

onMounted(() => {
  queryRef.value.startDay = flowQuery.value.startDay
  queryRef.value.endDay = flowQuery.value.endDay
  doQuery(queryRef.value)
})
</script>

<style scoped>
.queryRow {
  margin: 8px 3px;
}

.row-header {
  margin: 0.5rem;
}

#typePieDiv {
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

  #typePieDiv {
    font-size: small;
  }

  #typePieDiv > div > canvas {
    margin: 20px;
  }
}
</style>
