package controller

import (
	"cashbook-server/service/server"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
)

func GetServerInfo(c *gin.Context) {
	data := server.GetServerInfo()

	c.JSON(200, util.Success(data))
}
