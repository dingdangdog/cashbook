// store.js
import { reactive } from 'vue';
import type { FlowQuery } from '@/types/model/flow';

export const flowQuery: FlowQuery = reactive({
  pageNum: 1,
  pageSize: 20,
})

// 图表弹窗信息封装
export const chartDialog = reactive({
  chartDiaLogShow: false,
  chartDiaLogTitle: '每日消费曲线',
  showChartNum: 1,
})

export const resetFlowQuery = () => {
  flowQuery.id = undefined;
  flowQuery.startDay = undefined;
  flowQuery.endDay = undefined;
  flowQuery.type = undefined;
  flowQuery.payType = undefined;
  flowQuery.name = undefined;
  flowQuery.description = undefined;
}
