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
	inSumMap := make(map[string]float64)
	zeroSumMap := make(map[string]float64)

	for _, flow := range flowList {
		if flow.FlowType == "支出" {
			if sumMap[flow.Day] == 0 {
				sumMap[flow.Day] = flow.Money
			} else {
				sumMap[flow.Day] += flow.Money
			}
		} else if flow.FlowType == "收入" {
			if inSumMap[flow.Day] == 0 {
				inSumMap[flow.Day] = flow.Money
			} else {
				inSumMap[flow.Day] += flow.Money
			}
		} else {
			if zeroSumMap[flow.Day] == 0 {
				zeroSumMap[flow.Day] = flow.Money
			} else {
				zeroSumMap[flow.Day] += flow.Money
			}
		}
	}
	// 收入日期和支出日期合并，防止横轴不同步
	for day := range inSumMap {
		if sumMap[day] <= 0 {
			sumMap[day] = 0
		}
		if zeroSumMap[day] <= 0 {
			zeroSumMap[day] = 0
		}
	}

	lines := make([]types.DailyLine, 0)
	for day, money := range sumMap {
		dailyLine := types.DailyLine{
			Day:     day,
			DaySum:  strconv.FormatFloat(money, 'f', 2, 64),
			InSum:   strconv.FormatFloat(inSumMap[day], 'f', 2, 64),
			ZeroSum: strconv.FormatFloat(zeroSumMap[day], 'f', 2, 64),
		}
		lines = append(lines, dailyLine)
	}

	// sort by day
	for i := 0; i < len(lines); i++ {
		for j := i + 1; j < len(lines); j++ {
			if lines[i].Day > lines[j].Day {
				lines[i], lines[j] = lines[j], lines[i]
			}
		}
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
	datas := make([]types.TypeData, 0)
	for t, money := range sumMap {
		typePie := types.TypeData{
			Type:    t,
			TypeSum: money,
		}
		datas = append(datas, typePie)
	}
	// sort by sum
	for i := 0; i < len(datas); i++ {
		for j := i + 1; j < len(datas); j++ {
			if datas[i].TypeSum < datas[j].TypeSum {
				datas[i], datas[j] = datas[j], datas[i]
			}
		}
	}
	pies := make([]types.TypePie, 0)
	for i := 0; i < len(datas); i++ {
		pie := types.TypePie{}
		pie.Type = datas[i].Type
		pie.TypeSum = strconv.FormatFloat(datas[i].TypeSum, 'f', 2, 64)
		pies = append(pies, pie)
	}

	return pies
}

// GetPayTypeBar 获取支付类型饼图数据
func GetPayTypeBar(param types.FlowParam) []types.TypePie {
	flowList := dFlow.FindLists(param)
	sumMap := make(map[string]float64)
	for _, flow := range flowList {
		if sumMap[flow.PayType] == 0 {
			sumMap[flow.PayType] = flow.Money
		} else {
			sumMap[flow.PayType] += flow.Money
		}
	}
	datas := make([]types.TypeData, 0)
	for t, money := range sumMap {
		typePie := types.TypeData{
			Type:    t,
			TypeSum: money,
		}
		datas = append(datas, typePie)
	}
	// sort by sum
	for i := 0; i < len(datas); i++ {
		for j := i + 1; j < len(datas); j++ {
			if datas[i].TypeSum < datas[j].TypeSum {
				datas[i], datas[j] = datas[j], datas[i]
			}
		}
	}
	pies := make([]types.TypePie, 0)
	for i := 0; i < len(datas); i++ {
		pie := types.TypePie{}
		pie.Type = datas[i].Type
		pie.TypeSum = strconv.FormatFloat(datas[i].TypeSum, 'f', 2, 64)
		pies = append(pies, pie)
	}

	return pies
}

// MonthBar 获取月度统计数据
func MonthBar(bookId int64) []types.TypePie {
	flowList := dFlow.FindLists(types.FlowParam{BookId: bookId})
	sumMap := make(map[string]float64)
	inSumMap := make(map[string]float64)
	zeroSumMap := make(map[string]float64)

	for _, flow := range flowList {
		month := flow.Day[0:7]
		if flow.FlowType == "支出" {
			if sumMap[month] == 0 {
				sumMap[month] = flow.Money
			} else {
				sumMap[month] += flow.Money
			}
		} else if flow.FlowType == "收入" {
			if inSumMap[month] == 0 {
				inSumMap[month] = flow.Money
			} else {
				inSumMap[month] += flow.Money
			}
		} else {
			if zeroSumMap[month] == 0 {
				zeroSumMap[month] = flow.Money
			} else {
				zeroSumMap[month] += flow.Money
			}
		}
	}
	// 收入月份和支出月份合并，防止横轴不同步
	for month := range inSumMap {
		if sumMap[month] <= 0 {
			sumMap[month] = 0
		}
		if zeroSumMap[month] <= 0 {
			zeroSumMap[month] = 0
		}
	}

	months := make([]types.TypePie, 0)
	for month, money := range sumMap {
		typePie := types.TypePie{
			Type:    month,
			TypeSum: strconv.FormatFloat(money, 'f', 2, 64),
			InSum:   strconv.FormatFloat(inSumMap[month], 'f', 2, 64),
			ZeroSum: strconv.FormatFloat(zeroSumMap[month], 'f', 2, 64),
		}
		months = append(months, typePie)
	}

	// sort by month
	for i := 0; i < len(months); i++ {
		for j := i + 1; j < len(months); j++ {
			if months[i].Type > months[j].Type {
				months[i], months[j] = months[j], months[i]
			}
		}
	}

	return months
}
