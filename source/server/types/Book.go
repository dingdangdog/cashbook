package types

// Book 账本信息表
type Book struct {
	Id         int64  `json:"id"`
	BookName   string `json:"bookName"`
	UserId     int64  `json:"userId"`
	CreateDate string `json:"createDate"`
}

type BookQuery struct {
	ID       bool
	BookName bool
	UserId   bool
}
