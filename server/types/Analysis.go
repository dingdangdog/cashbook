package types

// TypePie Echarts相关数据实体 类型饼图、柱图等

type TypeData struct {
	Type    string  `json:"type"`
	TypeSum float64 `json:"typeSum"` // 总支出
	InSum   float64 `json:"inSum"`   // 总收入
}
type TypePie struct {
	Type    string `json:"type"`
	TypeSum string `json:"typeSum"` // 总支出
	InSum   string `json:"inSum"`   // 总收入
	ZeroSum string `json:"zeroSum"` // 总不计收支
}

// DailyLine Echarts相关数据实体 日消费曲线
type DailyLine struct {
	Day     string `json:"day"`
	DaySum  string `json:"daySum"`  // 总支出
	InSum   string `json:"inSum"`   // 总收入
	ZeroSum string `json:"zeroSum"` // 总不计收支
}

type MonthAnalysis struct {
	Month      string `json:"month"`
	OutSum     string `json:"outSum"`     // 总支出
	InSum      string `json:"inSum"`      // 总收入
	ZeroSum    string `json:"zeroSum"`    // 总不计收支
	MaxType    string `json:"maxType"`    // 最大支出类型
	MaxTypeSum string `json:"maxTypeSum"` // 最大支出金额
	MaxOut     Flow   `json:"maxOut"`     // 最大单笔支出
	MaxIn      Flow   `json:"maxIn"`      // 最大单笔收入
}
