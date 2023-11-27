package controller

import (
	"cashbook-server/service/user"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	data, _ := user.Login()

	c.JSON(200, util.Success(data))
}
