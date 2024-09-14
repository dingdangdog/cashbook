<template>
  <div class="chart-common-container">
    <div id="pieDiv" :style="`width: ${width}; height: ${height};`">
      <h3 v-if="noData">暂无数据</h3>
    </div>
    <h4 class="row-header">{{ title }}</h4>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue'
import { monthBar } from '@/api/api.analysis'
import { flowTableQuery, showFlowTableDialog } from '@/stores/flag'
import type { FlowQuery } from '@/model/flow'

// 使用 props 来接收外部传入的参数
const { title, width, height } = defineProps(['title', 'width', 'height'])

const dataListOut: any[] = []
const dataListIn: any[] = []
const notInOut: any[] = []
const xAxisList: any[] = []
const noData = ref(false)

const flowQuery = ref<FlowQuery>({ pageNum: 1, pageSize: 20 })

const optionRef = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },

  toolbox: {
    feature: {
      // 下载按钮
      // saveAsImage: {}
    }
  },
  xAxis: {
    name: '年月',
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
  },
  yAxis: {
    name: '金额(元)',
    type: 'value'
  },

  legend: {
    selected: {
      支出: true,
      收入: true,
      不计收支: false
    },
    data: [
      {
        name: '支出',
        textStyle: {
          color: 'rgba(217,159,8, 0.9)'
        }
      },
      {
        name: '收入',
        textStyle: {
          color: 'rgba(76, 152, 112, 0.9)'
        }
      },
      {
        name: '不计收支',
        textStyle: {
          color: 'rgba(66, 66, 66, 0.9)'
        }
      }
    ] // 系列的名称，与 series 中的 name 对应
  },
  series: [
    {
      name: '支出',
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar',
      itemStyle: {
        color: 'rgba(217,159,8, 0.9)'
      },
      label: {
        show: true,
        position: 'top',
        fontSize: 14,
        color: 'rgba(217,159,8, 0.9)'
      }
    },
    {
      name: '收入',
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar',
      itemStyle: {
        color: 'rgba(76, 152, 112, 0.9)'
      },
      label: {
        show: true,
        position: 'top',
        fontSize: 14,
        color: 'rgba(76, 152, 112, 0.9)'
      }
    },
    {
      name: '不计收支',
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar',
      itemStyle: {
        color: 'rgba(66, 66, 66, 0.9)'
      },
      label: {
        show: true,
        position: 'top',
        fontSize: 14,
        color: 'rgba(66, 66, 66, 0.9)'
      }
    }
  ]
})

let pieDiv: any
let pieChart: echarts.ECharts

const doQuery = () => {
  monthBar().then((res) => {
    if (res) {
      if (res.length === 0) {
        console.log('MonthBar未查询到数据！')
        noData.value = true
        return
      }
      dataListOut.length = 0
      dataListIn.length = 0
      notInOut.length = 0
      res.forEach((data) => {
        xAxisList.push(data.type)
        dataListOut.push(Number(data.typeSum).toFixed(2))
        dataListIn.push(Number(data.inSum).toFixed(2))
        notInOut.push(Number(data.zeroSum).toFixed(2))
      })
      optionRef.value.series[0].data = dataListOut
      optionRef.value.series[1].data = dataListIn
      optionRef.value.series[2].data = notInOut
      optionRef.value.xAxis.data = xAxisList

      pieDiv = document.getElementById('pieDiv')
      pieChart = echarts.init(pieDiv)
      pieChart.setOption(optionRef.value)
      pieChart.on('click', function (param) {
        flowQuery.value.startDay = param.name + '-01'
        flowQuery.value.endDay = param.name + '-31'

        flowTableQuery.value = flowQuery.value
        showFlowTableDialog.value = true
      })
    }
  })
}

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
  doQuery()
})
</script>

<style scoped>
.row-header {
  margin: 0.5rem;
}

#pieDiv {
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

  #pieDiv {
    font-size: small;
  }

  #pieDiv > div > canvas {
    margin: 20px;
  }
}
</style>
