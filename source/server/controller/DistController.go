package controller

import (
	"cashbook-server/dao"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
)

func GetDistList(c *gin.Context) {
	Type := c.Param("type")
	data := dao.GetDistList(Type)

	c.JSON(200, util.Success(data))
}
