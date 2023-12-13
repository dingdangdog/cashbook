package types

// Dict 字典表
type Dict struct {
	Id        int64  `json:"id"`
	Type      string `json:"type"`
	BookId    int64  `json:"bookId"`
	DictKey   string `json:"dictKey"`
	DictValue string `json:"dictValue"`
	Sort      int64  `json:"sort"`
}

type DictParam struct {
	Id        int64  `json:"id" form:"id"`
	Type      string `json:"type" form:"type"`
	BookId    int64  `json:"bookId" form:"bookId"`
	DictKey   string `json:"dictKey" form:"dictKey"`
	DictValue string `json:"dictValue" form:"dictValue"`
	PageNum   int64  `json:"pageNum" uri:"pageNum" form:"pageNum"`
	PageSize  int64  `json:"pageSize" uri:"pageSize" form:"pageSize"`
}

type DictQuery struct {
	Id        bool
	Type      bool
	BookId    bool
	DictKey   bool
	DictValue bool
	PageNum   bool
	PageSize  bool
}
