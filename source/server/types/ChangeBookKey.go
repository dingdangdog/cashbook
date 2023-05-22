package types

type ChangeBookKey struct {
	Id         int64  `json:"id"`
	BookName   string `json:"bookName"`
	OldKey     string `json:"oldKey"`
	BookKey    string `json:"bookKey"`
	CreateDate string `json:"createDate"`
}
