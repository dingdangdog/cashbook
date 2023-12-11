package online

import (
	"cashbook-server/dao"
	"cashbook-server/service/dict"
	"cashbook-server/service/flow"
	"cashbook-server/service/plan"
	"cashbook-server/types"
	"cashbook-server/util"
)

func GetUploadData(online types.Online) *types.OnlineData {
	flows := flow.GetAll(online.BookKey)
	plans := plan.GetAllPlan(online.BookKey)
	dist1 := dict.GetDistList(online.BookKey, "distType")
	dist2 := dict.GetDistList(online.BookKey, "expenseType")
	dist3 := dict.GetDistList(online.BookKey, "paymentType")
	dist1 = append(append(dist1, dist2...), dist3...)

	data := new(types.OnlineData)
	data.Flows = flows
	data.Plans = plans
	data.Dists = dist1

	return data
}

func SaveDownload(online types.Online, data types.OnlineData) int64 {
	tx, err := dao.db.Begin()
	num := util.CheckErr(err)
	if len(data.Flows) > 0 {
		// 保存流水数据
		flowFlag := flow.ImportFlowsDB(online.BookKey, "overwrite", data.Flows, tx)
		if flowFlag == 0 {
			return 0
		}
	}
	if len(data.Dists) > 0 {
		// 保存字典数据
		distFlag := dict.ImportDistsDB(online.BookKey, data.Dists, tx)
		if distFlag == 0 {
			return 0
		}
	}
	if len(data.Plans) > 0 {
		// 保存计划数据
		planFlag := plan.ImportPlansDB(online.BookKey, data.Plans, tx)
		if planFlag == 0 {
			return 0
		}
	}

	err = tx.Commit()
	num = util.CheckTxErr(tx, err)
	if num == 0 {
		return 0
	}
	return 1
}
