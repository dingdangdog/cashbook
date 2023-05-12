export interface DailyLineChartQuery {
  bookKey?: string;
  startDay?: string;
  endDay?: string;
}

export interface DailyLineChart {
  day: string;
  daySum: number;
}

export interface TypePieChartQuery {
  bookKey?: string;
  startDay?: string;
  endDay?: string;
}

export interface TypePieChart {
  type: string;
  typeSum: number;
}