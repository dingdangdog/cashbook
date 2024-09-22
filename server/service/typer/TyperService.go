package typer

import (
	dFlow "cashbook-server/dao/flow"
	"cashbook-server/types"
	"cashbook-server/util"
)

func GetFlowType(bookId int64) []types.Typer {
	flows := dFlow.FindLists(types.FlowParam{BookId: bookId})

	dicts := make([]types.Typer, 0)
	values := make([]string, 0)
	for _, flow := range flows {
		dict := types.Typer{}
		if !util.ArrayContains(values, flow.FlowType) {
			dict.Value = flow.FlowType
			dicts = append(dicts, dict)
			values = append(values, flow.FlowType)
		}
	}

	return dicts
}

func GetExpenseType(bookId int64, flowType string) []types.Typer {
	flows := dFlow.FindLists(types.FlowParam{BookId: bookId, FlowType: flowType})

	dicts := make([]types.Typer, 0)
	values := make([]string, 0)
	flowTypes := make([]string, 0)
	for _, flow := range flows {
		dict := types.Typer{}
		if !util.ArrayContains(values, flow.Type) || !util.ArrayContains(flowTypes, flow.FlowType) {
			dict.Type = "消费类型"
			dict.Value = flow.Type
			dict.FlowType = flow.FlowType
			dicts = append(dicts, dict)
			values = append(values, flow.Type)
			flowTypes = append(flowTypes, flow.FlowType)
		}
	}

	// sort by FlowType
	for i := 0; i < len(dicts); i++ {
		for j := i + 1; j < len(dicts); j++ {
			if dicts[i].FlowType > dicts[j].FlowType {
				dicts[i], dicts[j] = dicts[j], dicts[i]
			}
		}
	}

	return dicts
}

func GetPaymentType(bookId int64, flowType string) []types.Typer {
	flows := dFlow.FindLists(types.FlowParam{BookId: bookId, FlowType: flowType})

	dicts := make([]types.Typer, 0)
	values := make([]string, 0)
	flowTypes := make([]string, 0)
	for _, flow := range flows {
		dict := types.Typer{}
		if !util.ArrayContains(values, flow.PayType) || !util.ArrayContains(flowTypes, flow.FlowType) {
			dict.Type = "支付方式"
			dict.Value = flow.PayType
			dict.FlowType = flow.FlowType
			dicts = append(dicts, dict)
			values = append(values, flow.PayType)
			flowTypes = append(flowTypes, flow.FlowType)
		}
	}
	// sort by FlowType
	for i := 0; i < len(dicts); i++ {
		for j := i + 1; j < len(dicts); j++ {
			if dicts[i].FlowType > dicts[j].FlowType {
				dicts[i], dicts[j] = dicts[j], dicts[i]
			}
		}
	}

	return dicts
}

func UpdateType(typer types.Typer, bookId int64) int {
	flowParam := types.FlowParam{
		BookId:   bookId,
		FlowType: typer.FlowType,
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

func GetTypeRelation(bookId int64) map[string]string {
	return dFlow.GetTypeRelation(bookId)
}

func UpdateTypeRelation(bookId int64, data map[string]string) int {
	dFlow.UpdateTypeRelation(bookId, data)
	return 1
}
