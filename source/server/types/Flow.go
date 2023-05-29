package types

// Flow 流水信息表
type Flow struct {
	Id          int64   `json:"id"`
	BookKey     string  `json:"bookKey"`
	Day         string  `json:"day"`
	Type        string  `json:"type"`
	Money       float64 `json:"money"`
	PayType     string  `json:"payType"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
}
