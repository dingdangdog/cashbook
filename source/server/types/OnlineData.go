package types

type OnlineData struct {
	Flows []Flow `json:"flows"`
	Plans []Plan `json:"plans"`
	Dists []Dist `json:"dists"`
}
