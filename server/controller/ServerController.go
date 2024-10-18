package controller

import (
	"cashbook-server/service/server"
	"cashbook-server/types"
	"cashbook-server/util"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetServerInfo 获取服务器信息
func GetServerInfo(c *gin.Context) {
	data := server.GetServerInfo()

	c.JSON(200, util.Success(data))
}

func UpdateServerInfo(c *gin.Context) {
	var data types.PublicConfig
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}
	server.UpdateServerInfo(data)
	c.JSON(200, util.Success(data))
}
