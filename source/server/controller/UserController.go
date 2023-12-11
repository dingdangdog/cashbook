package controller

import (
	"cashbook-server/service/user"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
)

// Login 登录
func Login(c *gin.Context) {

	var u types.User
	if err := c.ShouldBindJSON(&u); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	data := user.Login(u)

	c.JSON(200, util.Success(data))
}
