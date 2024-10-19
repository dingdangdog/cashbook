package analysis

import (
	dFlow "cashbook-server/dao/flow"
	"cashbook-server/types"
	"math"
	"strconv"
)

// GetDailyLine 获取每日流水折线图数据
func GetDailyLine(param types.FlowParam) []types.DailyLine {
	flowList := dFlow.FindLists(param)

	sumMap := make(map[string]float64)     // 支出集合
	inSumMap := make(map[string]float64)   // 收入集合
	zeroSumMap := make(map[string]float64) // 不计收支集合
	// 计算每一天的支出、收入、不计收支
	for _, flow := range flowList {
		switch flow.FlowType {
		case "支出":
			sumMap[flow.Day] += flow.Money
		case "收入":
			inSumMap[flow.Day] += flow.Money
		default:
			zeroSumMap[flow.Day] += flow.Money
		}
	}

	// 处理横轴同步，确保所有天数在三个集合中都有值
	allDays := make(map[string]struct{}) // 用于保存所有的日期
	for day := range sumMap {
		allDays[day] = struct{}{}
	}
	for day := range inSumMap {
		allDays[day] = struct{}{}
	}
	for day := range zeroSumMap {
		allDays[day] = struct{}{}
	}

	// 遍历所有天数，同步收支数据，确保每一天都有值
	for day := range allDays {
		sumMap[day] = math.Max(sumMap[day], 0)
		inSumMap[day] = math.Max(inSumMap[day], 0)
		zeroSumMap[day] = math.Max(zeroSumMap[day], 0)
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

	// 计算每一天的支出、收入、不计收支
	for _, flow := range flowList {
		month := flow.Day[0:7]
		switch flow.FlowType {
		case "支出":
			sumMap[month] += flow.Money
		case "收入":
			inSumMap[month] += flow.Money
		default:
			zeroSumMap[month] += flow.Money
		}
	}

	// 处理横轴同步，确保所有天数在三个集合中都有值
	allMonths := make(map[string]struct{}) // 用于保存所有的日期
	for month := range sumMap {
		allMonths[month] = struct{}{}
	}
	for month := range inSumMap {
		allMonths[month] = struct{}{}
	}
	for month := range zeroSumMap {
		allMonths[month] = struct{}{}
	}

	// 遍历所有天数，同步收支数据，确保每一天都有值
	for month := range allMonths {
		sumMap[month] = math.Max(sumMap[month], 0)
		inSumMap[month] = math.Max(inSumMap[month], 0)
		zeroSumMap[month] = math.Max(zeroSumMap[month], 0)
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

func MonthAnalysis(bookId int64, month string) types.MonthAnalysis {
	monthBar := MonthBar(bookId)

	monthAnalysis := types.MonthAnalysis{Month: month}
	// 总收入、总支出、总不计收支复用
	for _, month := range monthBar {
		if month.Type == monthAnalysis.Month {
			monthAnalysis.OutSum = month.TypeSum
			monthAnalysis.InSum = month.InSum
			monthAnalysis.ZeroSum = month.ZeroSum
		}
	}
	if monthAnalysis.OutSum == "" && monthAnalysis.InSum == "" {
		// 当月支出和收入都是空的，无需继续查询
		return monthAnalysis
	}
	// 复用饼图统计获得最大消费(支出)类型
	flowParam := types.FlowParam{BookId: bookId, StartDay: month + "-01", EndDay: month + "-31", FlowType: "支出"}
	typeSum := GetTypePie(flowParam)
	if len(typeSum) > 0 {
		monthAnalysis.MaxType = typeSum[0].Type
		monthAnalysis.MaxTypeSum = typeSum[0].TypeSum
	} else {
		monthAnalysis.MaxType = "无"
		monthAnalysis.MaxTypeSum = "0"
	}

	// 查询当月全部流水，找出最大单笔支出和收入
	flowParam.FlowType = ""
	flowList := dFlow.FindLists(flowParam)
	maxOutFlow := types.Flow{}
	maxInFlow := types.Flow{}
	// 获取最大单笔支出和最大单笔收入
	for _, flow := range flowList {
		if flow.FlowType == "支出" {
			if flow.Money > maxOutFlow.Money {
				maxOutFlow = flow
			}
		} else if flow.FlowType == "收入" {
			if flow.Money > maxInFlow.Money {
				maxInFlow = flow
			}
		}
	}
	monthAnalysis.MaxIn = maxInFlow
	monthAnalysis.MaxOut = maxOutFlow
	return monthAnalysis
}
