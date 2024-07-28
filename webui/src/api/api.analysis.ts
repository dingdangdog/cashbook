import api from './index'
import type {
  DailyLineChartQuery,
  DailyLineChart,
  TypePieChartQuery,
  TypePieChart,
  MonthAnalysis
} from '../types/model/analysis'

/**
 * 查询每日消费曲线
 */
export function dailyLine(query: DailyLineChartQuery): Promise<DailyLineChart[]> {
  return api('dailyLine', localStorage.getItem("bookId"), query)
}

/**
 * 支出类型统计饼图
 */
export function typePie(query: TypePieChartQuery): Promise<TypePieChart[]> {
  // console.log(query)
  return api('typePie', localStorage.getItem("bookId"), query)
}

/**
 * 支付类型统计柱图
 */
export function payTypeBar(query: TypePieChartQuery): Promise<TypePieChart[]> {
  return api('payTypeBar', localStorage.getItem("bookId"), query)
}

/**
 * 按月统计柱图
 */
export function monthBar(): Promise<TypePieChart[]> {
  return api('monthBar', localStorage.getItem('bookId'))
}

/**
 * 按月统计生成汇报
 */
export function monthAnalysis(month: string): Promise<MonthAnalysis> {
  return api('monthAnalysis', localStorage.getItem('bookId'), month)
}
