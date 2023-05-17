package types

type Server struct {
	Id          int    `json:"id"`
	Version     string `json:"version"`
	Environment string `json:"environment"`
	CreateDate  string `json:"createDate"`
}
