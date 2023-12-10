package types

// Page 分页数据封装实体
type Page struct {
	PageNum    int64         `json:"pageNum"`
	PageSize   int64         `json:"pageSize"`
	TotalPage  int64         `json:"totalPage"`
	TotalCount int64         `json:"totalCount"`
	TotalMoney float64       `json:"totalMoney"`
	PageData   []interface{} `json:"pageData"`
}

// Result 返回数据同一封装
type Result struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}
