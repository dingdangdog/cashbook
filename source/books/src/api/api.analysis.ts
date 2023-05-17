import $http from './index'
import type { DailyLineChartQuery, DailyLineChart, TypePieChartQuery, TypePieChart } from '../types/model/analysis';

const prefix = '/flowApi/analysis';

/**
 * 查询每日消费曲线
 */
export function dailyLine(query: DailyLineChartQuery): Promise<DailyLineChart[]> {
  return $http({ url: prefix + "/dailyLine", method: "post", data: query })
}

/**
 * 消费类型统计饼图
 */
export function typePie(query: TypePieChartQuery): Promise<TypePieChart[]> {
  return $http({ url: prefix + "/typePie", method: "post", data: query })
}
