package plan

import (
	dPlan "cashbook-server/dao/plan"
	sAnalysis "cashbook-server/service/analysis"
	"cashbook-server/types"
	"cashbook-server/util"
	_ "modernc.org/sqlite"
	"strconv"
)

// SetPlan 添加计划
func SetPlan(plan types.Plan) {
	dPlan.AddOrUpdate(plan)
}

// UpdatePlan 更新计划
func UpdatePlan(plan types.Plan) {
	dPlan.Delete(plan.Id)
	dPlan.AddOrUpdate(plan)
}

// GetPlan 获取当月计划
func GetPlan(bookId int64, month string) types.Plan {
	return dPlan.FindLists(types.Plan{BookId: bookId, Month: month})[0]
}

// GetAllPlan 获取全部计划
func GetAllPlan(bookId int64) []types.Plan {
	return dPlan.FindLists(types.Plan{BookId: bookId})
}

// UpdatePlanUsed 更新计划使用情况
func UpdatePlanUsed(bookId int64) {
	// 获取当月支出
	months := sAnalysis.MonthBar(bookId)
	// 获取当月计划
	plans := dPlan.FindLists(types.Plan{BookId: bookId})
	for _, plan := range plans {
		for _, month := range months {
			if plan.Month == month.Type {
				// please cast month.TypeSum type from string to float64
				used, err := strconv.ParseFloat(month.TypeSum, 64)
				util.CheckErr(err)
				plan.UsedMoney = used
				dPlan.Delete(plan.Id)
				dPlan.AddOrUpdate(plan)
			}
		}
	}

}

// ImportPlans 导入计划 TODO
func ImportPlans(plans []types.Plan) int64 {
	return 1
}
