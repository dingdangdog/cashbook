package types

type Online struct {
	ServerAddress string `json:"serverAddress"`
	Secret        string `json:"secret"`
	BookKey       string `json:"bookKey"`
}
