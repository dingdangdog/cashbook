package dict

import (
	dFlow "cashbook-server/dao/flow"
	"cashbook-server/types"
	"cashbook-server/util"
)

func GetFlowType(bookId int64) []types.Dict {
	flows := dFlow.FindLists(types.FlowParam{BookId: bookId})

	dicts := make([]types.Dict, 0)
	values := make([]string, 0)
	for _, flow := range flows {
		dict := types.Dict{}
		if !util.ArrayContains(values, flow.FlowType) {
			dict.Value = flow.FlowType
			dicts = append(dicts, dict)
			values = append(values, flow.FlowType)
		}
	}

	return dicts
}

func GetExpenseType(bookId int64, flowType string) []types.Dict {
	flows := dFlow.FindLists(types.FlowParam{BookId: bookId, FlowType: flowType})

	dicts := make([]types.Dict, 0)
	values := make([]string, 0)
	for _, flow := range flows {
		dict := types.Dict{}
		if !util.ArrayContains(values, flow.Type) {
			dict.Type = "消费类型"
			dict.Value = flow.Type
			dicts = append(dicts, dict)
			values = append(values, flow.Type)
		}
	}

	return dicts
}

func GetPaymentType(bookId int64, flowType string) []types.Dict {
	flows := dFlow.FindLists(types.FlowParam{BookId: bookId, FlowType: flowType})

	dicts := make([]types.Dict, 0)
	values := make([]string, 0)
	for _, flow := range flows {
		dict := types.Dict{}
		if !util.ArrayContains(values, flow.PayType) {
			dict.Type = "支付方式"
			dict.Value = flow.PayType
			dicts = append(dicts, dict)
			values = append(values, flow.PayType)
		}
	}

	return dicts
}

func UpdateType(typer types.Dict, bookId int64) int {
	flowParam := types.FlowParam{
		BookId: bookId,
	}
	if typer.Type == "消费类型" {
		flowParam.Type = typer.OldValue
	} else if typer.Type == "支付方式" {
		flowParam.PayType = typer.OldValue
	}
	flows := dFlow.FindLists(flowParam)

	newFlows := make([]types.Flow, 0)
	for _, f := range flows {
		if typer.Type == "消费类型" {
			f.Type = typer.Value
		} else if typer.Type == "支付方式" {
			f.PayType = typer.Value
		}
		newFlows = append(newFlows, f)
	}
	dFlow.UpdateByBatch(newFlows, bookId)
	return len(flows)
}
