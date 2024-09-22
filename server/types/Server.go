package types

// Server 服务信息表
type Server struct {
	Version      string `json:"version"`
	Environment  string `json:"environment"`
	Mod          string `json:"mod"`
	Salt         string `json:"salt"`
	Key          string `json:"key"`
	Password     string `json:"password"`
	OpenRegister string `json:"openRegister"`
}
