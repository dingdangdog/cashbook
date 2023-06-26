package controller

import (
	"cashbook-server/dao"
	"cashbook-server/types"
	"cashbook-server/util"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"net/http"
)

func Upload(c *gin.Context) {
	var online types.Online
	if err := c.ShouldBindJSON(&online); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}
	online.BookKey = c.Request.Header.Get("bookKey")

	authJson := util.Get(online.ServerAddress + "/online/checkAuth?key=" + online.Secret)

	var auth types.Auth
	err := json.Unmarshal([]byte(authJson), &auth)
	util.CheckErr(err)
	if !auth.Flag {
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": auth,
		})
		return
	}

	data := dao.GetUploadData(online)
	// 将请求体转换为 JSON 字节
	jsonData, err := json.Marshal(data)
	util.CheckErr(err)
	uploadData := types.OnlineUpload{Key: online.Secret, Json: string(jsonData)}

	body, err := json.Marshal(uploadData)
	util.CheckErr(err)
	resp := util.PostJson(online.ServerAddress+"/online/upload", body)

	c.JSON(200, util.Success(resp))
}
