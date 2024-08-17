package types

// Server 服务信息表
type Server struct {
	Version     string `json:"version"`
	Environment string `json:"environment"`
	Secret      string `json:"secret"`
}
