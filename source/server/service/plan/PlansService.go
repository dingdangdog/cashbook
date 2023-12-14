package plan

import (
	dPlan "cashbook-server/dao/plan"
	"cashbook-server/types"
	"database/sql"
	_ "modernc.org/sqlite"
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
func UpdatePlanUsed(bookKey int64) {

}

// ImportPlans 导入计划 TODO
func ImportPlans(bookKey string, plans []types.Plan, tx *sql.Tx) int64 {
	return 1
}
