package online

import (
	sDict "cashbook-server/service/dict"
	sFlow "cashbook-server/service/flow"
	sPlan "cashbook-server/service/plan"
	"cashbook-server/types"
)

func GetUploadData(online types.Online) *types.OnlineData {
	flows := sFlow.GetBookAll(online.BookId)
	plans := sPlan.GetAllPlan(online.BookId)
	dict1 := sDict.GetDictList(online.BookId, "dictType")
	dict2 := sDict.GetDictList(online.BookId, "expenseType")
	dict3 := sDict.GetDictList(online.BookId, "paymentType")
	dict1 = append(append(dict1, dict2...), dict3...)

	data := new(types.OnlineData)
	data.Flows = flows
	data.Plans = plans
	data.Dicts = dict1

	return data
}

func SaveDownload(online types.Online, data types.OnlineData) int64 {
	if len(data.Flows) > 0 {
		// 保存流水数据
		flowFlag := sFlow.ImportFlows("overwrite", data.Flows)
		if flowFlag == 0 {
			return 0
		}
	}
	if len(data.Dicts) > 0 {
		// 保存字典数据
		dictFlag := sDict.ImportDict(data.Dicts)
		if dictFlag == 0 {
			return 0
		}
	}
	if len(data.Plans) > 0 {
		// 保存计划数据
		planFlag := sPlan.ImportPlans(data.Plans)
		if planFlag == 0 {
			return 0
		}
	}
	return 1
}
