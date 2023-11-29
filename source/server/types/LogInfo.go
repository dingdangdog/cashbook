package types

// LogInfo 登录后返回的用户信息
type LogInfo struct {
	Id    int64  `json:"id"`
	Token string `json:"token"`
}
