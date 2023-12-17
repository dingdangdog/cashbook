package analysis

import (
	dFlow "cashbook-server/dao/flow"
	"cashbook-server/types"
	"strconv"
)

// GetDailyLine 获取每日流水折线图数据
func GetDailyLine(param types.FlowParam) []types.DailyLine {
	flowList := dFlow.FindLists(param)
	sumMap := make(map[string]float64)

	// asc sort flowList by day
	for i := 0; i < len(flowList); i++ {
		for j := i + 1; j < len(flowList); j++ {
			if flowList[i].Day > flowList[j].Day {
				flowList[i], flowList[j] = flowList[j], flowList[i]
			}
		}
	}

	for _, flow := range flowList {
		if sumMap[flow.Day] == 0 {
			sumMap[flow.Day] = flow.Money
		} else {
			sumMap[flow.Day] += flow.Money
		}
	}
	lines := make([]types.DailyLine, len(sumMap))
	for day, money := range sumMap {
		dailyLine := types.DailyLine{
			Day:    day,
			DaySum: strconv.FormatFloat(money, 'f', 2, 64),
		}
		lines = append(lines, dailyLine)
	}

	return lines
}

// GetTypePie 获取消费类型饼图数据
func GetTypePie(param types.FlowParam) []types.TypePie {
	flowList := dFlow.FindLists(param)
	sumMap := make(map[string]float64)

	for _, flow := range flowList {
		if sumMap[flow.Type] == 0 {
			sumMap[flow.Type] = flow.Money
		} else {
			sumMap[flow.Type] += flow.Money
		}
	}
	pies := make([]types.TypePie, len(sumMap))
	for t, money := range sumMap {
		typePie := types.TypePie{
			Type:    t,
			TypeSum: strconv.FormatFloat(money, 'f', 2, 64),
		}
		pies = append(pies, typePie)
	}

	return pies
}

// GetPayTypeBar 获取支付类型饼图数据
func GetPayTypeBar(param types.FlowParam) []types.TypePie {
	flowList := dFlow.FindLists(param)
	sumMap := make(map[string]float64)
	// asc sort flowList by day
	for i := 0; i < len(flowList); i++ {
		for j := i + 1; j < len(flowList); j++ {
			if flowList[i].Day > flowList[j].Day {
				flowList[i], flowList[j] = flowList[j], flowList[i]
			}
		}
	}
	for _, flow := range flowList {
		if sumMap[flow.PayType] == 0 {
			sumMap[flow.PayType] = flow.Money
		} else {
			sumMap[flow.PayType] += flow.Money
		}
	}
	pies := make([]types.TypePie, len(sumMap))
	for t, money := range sumMap {
		typePie := types.TypePie{
			Type:    t,
			TypeSum: strconv.FormatFloat(money, 'f', 2, 64),
		}
		pies = append(pies, typePie)
	}

	return pies
}

// MonthBar 获取月度统计数据
func MonthBar(bookId int64) []types.TypePie {
	flowList := dFlow.FindLists(types.FlowParam{BookId: bookId})
	sumMap := make(map[string]float64)

	for _, flow := range flowList {
		month := flow.Day[0:7]
		if sumMap[month] == 0 {
			sumMap[month] = flow.Money
		} else {
			sumMap[month] += flow.Money
		}
	}
	months := make([]types.TypePie, len(sumMap))
	for month, money := range sumMap {
		typePie := types.TypePie{
			Type:    month,
			TypeSum: strconv.FormatFloat(money, 'f', 2, 64),
		}
		months = append(months, typePie)
	}

	return months
}
