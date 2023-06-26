package dao

import "cashbook-server/types"

func GetUploadData(online types.Online) *types.OnlineData {
	flows := GetAll(online.BookKey)
	plans := GetAllPlan(online.BookKey)
	dist1 := GetDistList(online.BookKey, "distType")
	dist2 := GetDistList(online.BookKey, "expenseType")
	dist3 := GetDistList(online.BookKey, "paymentType")
	dist1 = append(append(dist1, dist2...), dist3...)

	data := new(types.OnlineData)
	data.Flows = flows
	data.Plans = plans
	data.Dists = dist1

	return data
}
