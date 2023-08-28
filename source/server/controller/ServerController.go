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
	d := struct {
		CaptchaId string
	}{
		captcha.New(),
	}
	if d.CaptchaId != "" {
		var captcha types.CaptchaResp
		captcha.CaptchaId = d.CaptchaId
		captcha.ImageUrl = c.Request.Host + "/captcha/" + d.CaptchaId + ".png"
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

func VerifyCaptcha(captchaId string, value string) string {
	if captchaId == "" || value == "" {
		return "请求参数有误!"
	} else {
		if captcha.VerifyString(captchaId, value) {
			return "验证成功"
		} else {
			return "验证码错误"
		}
	}
}
