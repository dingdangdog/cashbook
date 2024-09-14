// store.js
import { reactive, ref } from 'vue'
import type { FlowQuery } from '@/model/flow'

export const flowQuery = ref<FlowQuery>({
  pageNum: 1,
  pageSize: 20
})

// 图表弹窗信息封装
export const chartDialog = reactive({
  chartDiaLogShow: false,
  chartDiaLogTitle: '每日消费曲线',
  showChartNum: 1
})

export const resetFlowQuery = () => {
  flowQuery.value = { pageNum: 1, pageSize: 20 }
}

export const typeRelation = ref<Record<string, string>>({})

export const updatePlanFlag = ref(0)
