package types

// Server 服务信息表
type Server struct {
	Version     string `json:"version"`
	Environment string `json:"environment"`
	ServerPath  string `json:"serverPath"`
	Secret      string `json:"secret"`
}
