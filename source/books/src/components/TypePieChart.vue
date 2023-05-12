<template>
  <el-row class="queryRow">
    <div class="queryParam">
      <el-date-picker v-model="queryRef.startDay" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
        placeholder="开始时间" />
    </div>
    <div class="queryParam pc-button">
      <el-date-picker v-model="queryRef.endDay" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
        placeholder="结束时间" />
    </div>
    <div class="queryParam pc-button">
      <el-button :icon="Search" circle @click="doQuery(queryRef)" />
    </div>
  </el-row>

  <el-row class="mini-buttons">
    <div class="queryParam">
      <el-date-picker v-model="queryRef.endDay" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
        placeholder="结束时间" />
    </div>
    <div class="queryParam">
      <el-button :icon="Search" circle @click="doQuery(queryRef)" />
    </div>
  </el-row>
  <div id="pieDiv">
  </div>
</template>

<script setup lang="ts">
import type { TypePieChartQuery } from '@/types/model/analysis';
import { Search } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { typePie } from '../api/api.analysis';
import { flowQuery, chartDialog, isDark } from '../utils/store';

const query: TypePieChartQuery = {
}
const queryRef = ref(query);

const dataList: any[] = [];

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
      saveAsImage: {}
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
          return param.name + ' (' + param.percent + '%)';
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
});

var pieDiv: any;
var pieChart: echarts.ECharts;

const doQuery = (query: TypePieChartQuery) => {
  flowQuery.startDay = queryRef.value.startDay;
  flowQuery.endDay = queryRef.value.endDay;
  typePie(query).then(res => {
    if (res) {
      if (res.length === 0) {
        ElMessage.error("未查询到数据！");
        return;
      }
      dataList.length = 0;
      res.forEach((data) => {
        dataList.push({
          value: Number(data.typeSum).toFixed(2),
          name: data.type,
        });
      })
      optionRef.value.series[0].data = dataList;
      optionRef.value.legend.textStyle.color = isDark.value.valueOf() ? '#fff' : '#000';

      if (document.body.clientWidth <= 480) {
        optionRef.value.series[0].radius = ['30%', '50%'];
      }


      pieDiv = document.getElementById('pieDiv');
      pieChart = echarts.init(pieDiv);
      pieChart.setOption(optionRef.value);
      pieChart.on('click', function (param) {
        flowQuery.startDay = queryRef.value.startDay;
        flowQuery.endDay = queryRef.value.endDay;
        flowQuery.type = param.name;
        chartDialog.chartDiaLogShow = false;
      });
    }
  })
}


onMounted(() => {
  queryRef.value.startDay = flowQuery.startDay;
  queryRef.value.endDay = flowQuery.endDay;
  doQuery(queryRef.value);
})
</script>

<style scoped>
.queryRow {
  margin: 8px 3px;
}

.queryParam {
  margin: 8px 3px;
}

#pieDiv {
  width: 100%;
  height: 400px;
  padding: 10px
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

  #pieDiv>div>canvas {
    margin: 20px;
  }
}
</style>