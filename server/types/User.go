package types

// User 用户信息表
type User struct {
	Id         int64  `json:"id"`
	Name       string `json:"name"`
	UserName   string `json:"userName"`
	Password   string `json:"password"`
	Background string `json:"background"`
}

type UserQuery struct {
	ID       bool
	Name     bool
	UserName bool
	Password bool
}

// LogInfo 登录后返回的用户信息
type LogInfo struct {
	Id         int64  `json:"id"`
	Name       string `json:"name"`
	Background string `json:"background"`
	Token      string `json:"token"`
}

type NewPassword struct {
	Old string `json:"old"`
	New string `json:"new"`
}

type ResetPassword struct {
	UserName  string `json:"userName"`
	ServerKey string `json:"serverKey"`
}
