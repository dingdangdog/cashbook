package types

type FlowQuery struct {
	PageNum     int64  `json:"pageNum" uri:"pageNum" form:"pageNum"`
	PageSize    int64  `json:"pageSize" uri:"pageSize" form:"pageSize"`
	Id          int64  `json:"id" uri:"id" form:"id"`
	BookKey     string `json:"bookKey" uri:"bookKey" form:"bookKey"`
	StartDay    string `json:"startDay" uri:"startDay" form:"startDay"`
	EndDay      string `json:"endDay" uri:"endDay" form:"endDay"`
	Type        string `json:"type" uri:"type" form:"type"`
	PayType     string `json:"payType" uri:"payType" form:"payType"`
	Name        string `json:"name" uri:"name" form:"name"`
	Description string `json:"description" uri:"description" form:"description"`
}
