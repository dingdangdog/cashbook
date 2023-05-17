package types

type Dist struct {
	Id        int    `json:"id"`
	Type      string `json:"type"`
	DistKey   string `json:"distKey"`
	DistValue string `json:"distValue"`
	Sort      int    `json:"sort"`
}
