package types

// Plan 支出计划
type Plan struct {
	Id         int64   `json:"id"`
	BookId     int64   `json:"bookId"`
	Month      string  `json:"month"`
	LimitMoney float64 `json:"limitMoney"`
	UsedMoney  float64 `json:"usedMoney"`
}

type PlanQuery struct {
	ID     bool
	BookId bool
	Month  bool
}
