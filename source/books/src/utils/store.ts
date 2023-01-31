// store.js
import { reactive } from 'vue';
import type { FlowQuery } from '../types/model/flow';
import { useDark } from '@vueuse/core';

export const flowQuery: FlowQuery = reactive({
  pageNum: 1,
  pageSize: 10,
})

// 图表弹窗信息封装
export const chartDialog = reactive({
  chartDiaLogShow: false,
  chartDiaLogTitle: '每日消费曲线',
  showChartNum: 1,
})


// 设置主题，用于判断主题色是否为暗色
export const isDark = useDark({
  storageKey: 'vitepress-theme-appearance',
})