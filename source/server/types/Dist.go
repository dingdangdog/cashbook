package types

type Dist struct {
	Id        int64  `json:"id"`
	Type      string `json:"type"`
	DistKey   string `json:"distKey"`
	DistValue string `json:"distValue"`
	Sort      int64  `json:"sort"`
}
