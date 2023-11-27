package types

// User 用户信息表
type User struct {
	Id       int64  `json:"id"`
	UserName string `json:"userName"`
	Password string `json:"password"`
}

type UserQuery struct {
	ID       bool
	UserName bool
	Password bool
}
