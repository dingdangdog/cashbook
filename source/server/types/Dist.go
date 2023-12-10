package types

// Dist 字典表
type Dist struct {
	Id        int64  `json:"id"`
	Type      string `json:"type"`
	DistKey   string `json:"distKey"`
	DistValue string `json:"distValue"`
	Sort      int64  `json:"sort"`
	BookKey   string `json:"bookKey"`
}

type DistQuery struct {
	Id        int64  `json:"id" form:"id"`
	Type      string `json:"type" form:"type"`
	BookKey   string `json:"bookKey"`
	DistKey   string `json:"distKey" form:"distKey"`
	DistValue string `json:"distValue" form:"distValue"`
	PageNum   int64  `json:"pageNum" uri:"pageNum" form:"pageNum"`
	PageSize  int64  `json:"pageSize" uri:"pageSize" form:"pageSize"`
}
