package controller

import (
	"cashbook-server/dao"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
)

func GetServerInfo(c *gin.Context) {
	data := dao.GetServerInfo()

	c.JSON(200, util.Success(data))
}
