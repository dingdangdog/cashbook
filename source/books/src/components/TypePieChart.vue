<template>
  <el-row class="queryRow" justify="center">
    <div class="queryParam">
      <el-date-picker v-model="queryRef.startDay" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
        placeholder="开始时间" />
    </div>
    <div class="queryParam">
      <el-date-picker v-model="queryRef.endDay" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
        placeholder="结束时间" />
    </div>
    <div class="queryParam">
      <el-button :icon="Search" circle @click="doQuery(queryRef)" />
    </div>
  </el-row>
  <div id="pieDiv" style="width:100%; height:400px; padding:10px">
  </div>
</template>

<script setup lang="ts">
import type { TypePieChartQuery } from '@/types/model/analysis';
import { Search } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { typePie } from '../api/api.analysis';
import { flowQuery, chartDialog, isDark} from '../utils/store';

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
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
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
          value: Number(data.typeSum.toFixed(2)),
          name: data._id,
        });
      })
      optionRef.value.series[0].data = dataList;
      optionRef.value.legend.textStyle.color = isDark.value.valueOf() ? '#fff' : '#000';
      pieDiv = document.getElementById('pieDiv');
      pieChart = echarts.init(pieDiv);
      pieChart.setOption(optionRef.value);
      pieChart.on('click', function (param){
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
.queryRow .queryParam {
  margin: 8px 3px;
}
</style>