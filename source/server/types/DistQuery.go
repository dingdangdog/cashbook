package types

type DistQuery struct {
	Id        int64  `json:"id" form:"id"`
	Type      string `json:"type" form:"type"`
	DistKey   string `json:"distKey" form:"distKey"`
	DistValue string `json:"distValue" form:"distValue"`
	PageNum   int64  `json:"pageNum" uri:"pageNum" form:"pageNum"`
	PageSize  int64  `json:"pageSize" uri:"pageSize" form:"pageSize"`
}
