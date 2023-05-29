package types

// Plan 支出计划
type Plan struct {
	Month      string  `json:"month"`
	LimitMoney float64 `json:"limitMoney"`
	UsedMoney  float64 `json:"usedMoney"`
}
