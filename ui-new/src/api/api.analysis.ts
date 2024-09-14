import $http from './index'
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
  return $http({ url: prefix + '/dailyLine', method: 'post', data: query })
}

/**
 * 支出类型统计饼图
 */
export function typePie(query: TypePieChartQuery): Promise<TypePieChart[]> {
  return $http({ url: prefix + '/typePie', method: 'post', data: query })
}

/**
 * 支付类型统计柱图
 */
export function payTypeBar(query: TypePieChartQuery): Promise<TypePieChart[]> {
  return $http({ url: prefix + '/payTypeBar', method: 'post', data: query })
}

/**
 * 按月统计柱图
 */
export function monthBar(): Promise<TypePieChart[]> {
  return $http({ url: prefix + '/monthBar', method: 'post' })
}

/**
 * 按月统计生成汇报
 */
export function monthAnalysis(month: string): Promise<MonthAnalysis> {
  return $http({ url: prefix + '/monthAnalysis?month=' + month, method: 'get' })
}
