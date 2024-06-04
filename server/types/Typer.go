package types

import "sync"

// Typer 类型操作实体
type Typer struct {
	Mu       sync.Mutex
	FlowType string `json:"flowType"`
	Type     string `json:"type"`
	Value    string `json:"value"`
	OldValue string `json:"oldValue"`
}
