package types

// Book 账本信息表
type Book struct {
	Id         int64  `json:"id"`
	BookName   string `json:"bookName"`
	BookKey    string `json:"bookKey"`
	CreateDate string `json:"createDate"`
}
