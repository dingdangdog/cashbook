package types

// Typer 类型操作实体
type Typer struct {
	FlowType string `json:"flowType"`
	Type     string `json:"type"`
	Value    string `json:"value"`
	OldValue string `json:"oldValue"`
}
