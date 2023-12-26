package controller

import (
	"cashbook-server/service/user"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

func Register(c *gin.Context) {
	var u types.User
	if err := c.ShouldBindJSON(&u); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	id := user.Register(u)
	if id == 0 {
		c.JSON(500, util.Error("注册失败", id))
		return
	}
	c.JSON(200, util.Success(id))
}

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
	flag := c.Query("flag")

	boolFlag, err := strconv.ParseBool(flag)
	util.CheckErr(err)

	data, err := user.Login(boolFlag, u)
	if err != nil {
		c.JSON(200, util.Error(err.Error(), data))
		return
	}
	c.JSON(200, util.Success(data))
}

// CheckPassword /* 校验密码是否正确 */
func CheckPassword(c *gin.Context) {
	password := c.Param("password")
	userId := util.GetUserId(c)
	boolean := user.CheckPassword(userId, password)
	c.JSON(200, util.Success(boolean))
}

// ChangePassword /* 修改密码 */
func ChangePassword(c *gin.Context) {
	var newPassword types.NewPassword
	if err := c.ShouldBindJSON(&newPassword); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}
	userId := util.GetUserId(c)
	if !user.CheckPassword(userId, newPassword.Old) {
		c.JSON(200, util.Error("原密码错误！", false))
		return
	}
	boolean := user.ChangePassword(userId, newPassword.New)
	c.JSON(200, util.Success(boolean))
}
