package flow

import (
	dFlow "cashbook-server/dao/flow"
	"cashbook-server/types"
	"cashbook-server/util"
)

// AddFlow 添加流水
func AddFlow(flow types.Flow) int64 {
	return dFlow.AddOrUpdate(flow)
}

// UpdateFlow 更新流水
func UpdateFlow(flow types.Flow) {
	dFlow.Delete(flow.Id, flow.BookId)
	dFlow.AddOrUpdate(flow)
}

// DeleteFlow 删除流水
func DeleteFlow(id int64, bookId int64) {
	dFlow.Delete(id, bookId)
}

// GetFlowsPage 获取流水分页
func GetFlowsPage(flowQuery types.FlowParam) types.Page {
	flows := dFlow.FindLists(flowQuery)

	totalMoney := 0.0
	objs := make([]interface{}, len(flows))
	for i, d := range flows {
		objs[i] = d
		totalMoney += d.Money
	}

	page := util.GetPage(flowQuery.PageNum, flowQuery.PageSize, objs)
	page.TotalMoney = totalMoney
	return page
}

// GetBookAll 获取指定账本全部流水
func GetBookAll(bookId int64) []types.Flow {
	return dFlow.FindLists(types.FlowParam{BookId: bookId})
}

// ImportFlows 导入流水
func ImportFlows(flag string, flows []types.Flow) int {
	if flag == "overwrite" {
		dFlow.DeleteBatch(flows[0].BookId)
	}
	return dFlow.AddByBatch(flows)
}
