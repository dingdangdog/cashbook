package online

import (
	sFlow "cashbook-server/service/flow"
	sPlan "cashbook-server/service/plan"
	"cashbook-server/types"
)

func GetUploadData(online types.Online) *types.OnlineData {
	flows := sFlow.GetBookAll(online.BookId)
	plans := sPlan.GetAllPlan(online.BookId)

	data := new(types.OnlineData)
	data.Flows = flows
	data.Plans = plans

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
	if len(data.Plans) > 0 {
		// 保存计划数据
		planFlag := sPlan.ImportPlans(data.Plans)
		if planFlag == 0 {
			return 0
		}
	}
	return 1
}
