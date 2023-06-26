package types

type Auth struct {
	Flag bool     `json:"flag"`
	Auth AuthInfo `json:"auth"`
}

type AuthInfo struct {
	Key   string `json:"key"`
	State int64  `json:"state"`
	Limit int64  `json:"limit"`
	Day   int64  `json:"day"`
}
