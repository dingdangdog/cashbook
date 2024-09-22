import { MOD } from '@/stores/flag'
import $http from './index'
import local from './local'

import type {
  DailyLineChartQuery,
  DailyLineChart,
  TypePieChartQuery,
  TypePieChart,
  MonthAnalysis
} from '@/model/analysis'

const prefix = '/admin/analysis'

/**
 * 查询每日消费曲线
 */
export function dailyLine(query: DailyLineChartQuery): Promise<DailyLineChart[]> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/dailyLine', method: 'post', data: query })
  } else {
    return local('dailyLine', localStorage.getItem('bookId'), query)
  }
}

/**
 * 支出类型统计饼图
 */
export function typePie(query: TypePieChartQuery): Promise<TypePieChart[]> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/typePie', method: 'post', data: query })
  } else {
    return local('typePie', localStorage.getItem('bookId'), query)
  }
}

/**
 * 支付类型统计柱图
 */
export function payTypeBar(query: TypePieChartQuery): Promise<TypePieChart[]> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/payTypeBar', method: 'post', data: query })
  } else {
    return local('payTypeBar', localStorage.getItem('bookId'), query)
  }
}

/**
 * 按月统计柱图
 */
export function monthBar(): Promise<TypePieChart[]> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/monthBar', method: 'post' })
  } else {
    return local('monthBar', localStorage.getItem('bookId'))
  }
}

/**
 * 按月统计生成汇报
 */
export function monthAnalysis(month: string): Promise<MonthAnalysis> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/monthAnalysis?month=' + month, method: 'get' })
  } else {
    return local('monthAnalysis', localStorage.getItem('bookId'), month)
  }
}
