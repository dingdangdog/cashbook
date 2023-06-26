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
		c.JSON(http.StatusInternalServerError, util.Error("参数处理异常", nil))
		return
	}
	online.BookKey = c.Request.Header.Get("bookKey")

	authJson := util.Get(online.ServerAddress + "/online/checkAuth?key=" + online.Secret)

	var auth types.Auth
	err := json.Unmarshal([]byte(authJson), &auth)
	util.CheckErr(err)
	if !auth.Flag {
		c.JSON(http.StatusNonAuthoritativeInfo, util.ErrorAll(http.StatusNonAuthoritativeInfo, "授权码异常", auth))
		return
	}

	data := dao.GetUploadData(online)
	// 将请求体转换为 JSON 字节
	jsonData, err := json.Marshal(data)
	if util.CheckErr(err) == 0 {
		c.JSON(http.StatusServiceUnavailable, util.Error("数据处理出错", nil))
		return
	}
	uploadData := types.OnlineUpload{Key: online.Secret, Json: string(jsonData)}

	body, err := json.Marshal(uploadData)
	if util.CheckErr(err) == 0 {
		c.JSON(http.StatusServiceUnavailable, util.Error("数据处理出错", nil))
		return
	}

	resp := util.PostJson(online.ServerAddress+"/online/upload", body)

	if resp != "true" {
		c.JSON(http.StatusServiceUnavailable, util.Error("数据上传出错", nil))
		return
	}
	c.JSON(http.StatusOK, util.Success(resp))
}

func Download(c *gin.Context) {
	var online types.Online
	if err := c.ShouldBindJSON(&online); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusInternalServerError, util.Error("参数处理异常", nil))
		return
	}
	online.BookKey = c.Request.Header.Get("bookKey")

	authJson := util.Get(online.ServerAddress + "/online/checkAuth?key=" + online.Secret)

	var auth types.Auth
	err := json.Unmarshal([]byte(authJson), &auth)

	if util.CheckErr(err) == 0 {
		c.JSON(http.StatusNonAuthoritativeInfo, util.Error("授权码异常", nil))
		return
	}
	if auth.Auth.State == 0 {
		c.JSON(http.StatusNonAuthoritativeInfo, util.Error("授权码无效", auth))
		return
	}

	resp := util.Get(online.ServerAddress + "/online/download?key=" + online.Secret)

	var downdata types.OnlineUpload
	err = json.Unmarshal([]byte(resp), &downdata)
	if util.CheckErr(err) == 0 {
		c.JSON(http.StatusNonAuthoritativeInfo, util.Error("数据下载异常", nil))
		return
	}

	var data types.OnlineData
	err = json.Unmarshal([]byte(downdata.Json), &data)
	if util.CheckErr(err) == 0 {
		c.JSON(http.StatusNonAuthoritativeInfo, util.Error("数据处理出错", nil))
		return
	}

	flag := dao.SaveDownload(online, data)
	if flag == 0 {
		c.JSON(http.StatusNonAuthoritativeInfo, util.Error("数据保存出错", nil))
		return
	}
	c.JSON(http.StatusOK, util.Success(flag))
}
