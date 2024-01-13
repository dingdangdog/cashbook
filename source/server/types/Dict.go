package types

// Dict 字典表
type Dict struct {
	FlowType string `json:"flowType"`
	Type     string `json:"type"`
	Value    string `json:"value"`
	OldValue string `json:"oldValue"`
}
