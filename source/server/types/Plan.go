package types

// Plan 支出计划
type Plan struct {
	Id         int64   `json:"id"`
	BookKey    string  `json:"bookKey"`
	Month      string  `json:"month"`
	LimitMoney float64 `json:"limitMoney"`
	UsedMoney  float64 `json:"usedMoney"`
}
