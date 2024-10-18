package types

// Server 服务信息表
type Server struct {
	Environment string       `json:"environment"`
	Salt        string       `json:"salt"`
	Key         string       `json:"key"`
	Password    string       `json:"password"`
	Public      PublicConfig `json:"public"`
}

type PublicConfig struct {
	Version      string `json:"version"`
	OpenRegister string `json:"openRegister"`
}
