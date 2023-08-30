package controller

import (
	"bytes"
	"cashbook-server/dao"
	"cashbook-server/types"
	"cashbook-server/util"
	"net/http"
	"strings"

	"github.com/dchest/captcha"
	"github.com/gin-gonic/gin"
)

func GetServerInfo(c *gin.Context) {
	data := dao.GetServerInfo()

	c.JSON(200, util.Success(data))
}

func Captcha(c *gin.Context) {
	CaptchaId := captcha.New()
	if CaptchaId != "" {
		var captcha types.CaptchaResp
		captcha.CaptchaId = CaptchaId
		captcha.ImageUrl = "/captcha/" + CaptchaId + ".png"
		c.JSON(200, util.Success(captcha))
	} else {
		c.JSON(200, util.Error("服务内部错误!", 0))
	}
}

func CaptchaHandle(c *gin.Context) {
	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	c.Header("Content-Type", "image/png")

	id := strings.Replace(c.Params.ByName("img"), ".png", "", -1)
	var content bytes.Buffer

	err := captcha.WriteImage(&content, id, 200, 50)
	util.CheckErr(err)

	contentLength := content.Len()
	contentType := c.GetHeader("Content-Type")

	c.DataFromReader(http.StatusOK, int64(contentLength), contentType, bytes.NewReader(content.Bytes()), nil)
}

// 验证码核验
func VerifyCaptcha(captchaId string, value string) (bool, string) {
	if captchaId == "" || value == "" {
		return false, "请求参数错误"
	} else {
		if captcha.VerifyString(captchaId, value) {
			return true, "验证成功"
		} else {
			return false, "验证失败"
		}
	}
}
