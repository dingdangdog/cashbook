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
			dict.Value = flow.PayType
			dicts = append(dicts, dict)
			values = append(values, flow.PayType)
		}
	}

	return dicts
}
