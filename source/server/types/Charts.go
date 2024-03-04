package types

// TypePie Echarts相关数据实体 类型饼图、柱图等

type TypeData struct {
	Type    string  `json:"type"`
	TypeSum float64 `json:"typeSum"`
	InSum   float64 `json:"inSum"`
}
type TypePie struct {
	Type    string `json:"type"`
	TypeSum string `json:"typeSum"`
	InSum   string `json:"inSum"`
	ZeroSum string `json:"zeroSum"`
}

// DailyLine Echarts相关数据实体 日消费曲线
type DailyLine struct {
	Day     string `json:"day"`
	DaySum  string `json:"daySum"`
	InSum   string `json:"inSum"`
	ZeroSum string `json:"zeroSum"`
}
