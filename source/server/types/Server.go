package types

// 服务信息表
type Server struct {
	Id          int    `json:"id"`
	Version     string `json:"version"`
	Environment string `json:"environment"`
	CreateDate  string `json:"createDate"`
}
