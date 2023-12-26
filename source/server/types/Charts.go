package types

// TypePie Echarts相关数据实体 类型饼图、柱图等
type TypePie struct {
	Type    string `json:"type"`
	TypeSum string `json:"typeSum"`
	InSum   string `json:"inSum"`
}

// DailyLine Echarts相关数据实体 日消费曲线
type DailyLine struct {
	Day    string `json:"day"`
	DaySum string `json:"daySum"`
	InSum  string `json:"inSum"`
}
