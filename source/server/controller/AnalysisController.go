package controller

import (
	"cashbook-server/dao"
	"cashbook-server/types"
	"cashbook-server/util"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func GetDailyLine(c *gin.Context) {
	var query types.FlowQuery
	if err := c.ShouldBindJSON(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = sessions.Default(c).Get("bookKey").(string)

	data := dao.GetDailyLine(query)

	c.JSON(200, util.Success(data))
}

func GetTypePie(c *gin.Context) {
	var query types.FlowQuery
	if err := c.ShouldBindJSON(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = sessions.Default(c).Get("bookKey").(string)

	data := dao.GetTypePie(query)

	c.JSON(200, util.Success(data))
}

func GetPayTypeBar(c *gin.Context) {
	var query types.FlowQuery
	if err := c.ShouldBindJSON(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = sessions.Default(c).Get("bookKey").(string)

	data := dao.GetPayTypeBar(query)

	c.JSON(200, util.Success(data))
}

func MonthBar(c *gin.Context) {
	bookKey := sessions.Default(c).Get("bookKey").(string)

	data := dao.MonthBar(bookKey)

	c.JSON(200, util.Success(data))
}
