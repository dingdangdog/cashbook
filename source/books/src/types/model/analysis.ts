export interface DailyLineChartQuery {
  bookId?: number;
  startDay?: string;
  endDay?: string;
}

export interface DailyLineChart {
  day: string;
  daySum: number;
}

export interface TypePieChartQuery {
  bookId?: number;
  startDay?: string;
  endDay?: string;
}

export interface TypePieChart {
  type: string;
  typeSum: number;
}