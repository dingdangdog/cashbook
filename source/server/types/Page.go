package types

type Page struct {
	PageNum    int64         `json:"pageNum"`
	PageSize   int64         `json:"pageSize"`
	TotalPage  int64         `json:"totalPage"`
	TotalCount int64         `json:"totalCount"`
	TotalMoney float64       `json:"totalMoney"`
	PageData   []interface{} `json:"pageData"`
}
