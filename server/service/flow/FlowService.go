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

// DeleteFlows 删除流水
func DeleteFlows(ids []int64, bookId int64) {
	dFlow.DeleteByIds(ids, bookId)
}

// GetFlowsPage 获取流水分页
func GetFlowsPage(flowQuery types.FlowParam) types.Page {
	flows := dFlow.FindLists(flowQuery)

	totalOut := 0.0
	totalIn := 0.0
	notInOut := 0.0
	objs := make([]interface{}, len(flows))
	for i, d := range flows {
		objs[i] = d
		if d.FlowType == "支出" {
			totalOut += d.Money
		} else if d.FlowType == "收入" {
			totalIn += d.Money
		} else {
			notInOut += d.Money
		}
	}

	page := util.GetPage(flowQuery.PageNum, flowQuery.PageSize, objs)
	page.TotalOut = totalOut
	page.TotalIn = totalIn
	page.NotInOut = notInOut
	return page
}

// GetBookAll 获取指定账本全部流水
func GetBookAll(bookId int64) []types.Flow {
	return dFlow.FindLists(types.FlowParam{BookId: bookId})
}

// ImportFlows 导入流水
func ImportFlows(flag string, flows []types.Flow, bookId int64) int {
	if flag == "overwrite" {
		dFlow.DeleteBatch(bookId)
	}
	return dFlow.AddByBatch(flows, bookId)
}

func InitFlows(bookId int64) {
	dFlow.InitFlows(bookId)
}

func UploadInvoice(bookId int64, flowId int64, invoice string) {
	flows := GetBookAll(bookId)

	for _, flow := range flows {
		if flow.Id == flowId {
			flow.Invoice = invoice
			UpdateFlow(flow)
			return
		}
	}
}
