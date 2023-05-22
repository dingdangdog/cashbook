package controller

import (
	"cashbook-server/dao"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GetDailyLine(c *gin.Context) {
	var query types.FlowQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = c.Request.Header.Get("bookKey")

	data := dao.GetDailyLine(query)

	c.JSON(200, util.Success(data))
}

func GetTypePie(c *gin.Context) {
	var query types.FlowQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = c.Request.Header.Get("bookKey")

	data := dao.GetTypePie(query)

	c.JSON(200, util.Success(data))
}

func GetPayTypeBar(c *gin.Context) {
	var query types.FlowQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = c.Request.Header.Get("bookKey")

	data := dao.GetPayTypeBar(query)

	c.JSON(200, util.Success(data))
}
