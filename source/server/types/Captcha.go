package types

type CaptchaResp struct {
	CaptchaId string `json:"captchaId"`
	ImageUrl string `json:"imageUrl"`
}

type CaptchaRespError struct {
	Code    int    `json:"code"`
	Message string `json:"message,omitempty"`
}
