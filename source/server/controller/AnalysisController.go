package controller

import (
	"cashbook-server/service/analysis"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GetDailyLine(c *gin.Context) {
	var query types.FlowParam
	if err := c.ShouldBindJSON(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = c.Request.Header.Get("bookKey")

	data := analysis.GetDailyLine(query)

	c.JSON(200, util.Success(data))
}

func GetTypePie(c *gin.Context) {
	var query types.FlowParam
	if err := c.ShouldBindJSON(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = c.Request.Header.Get("bookKey")

	data := analysis.GetTypePie(query)

	c.JSON(200, util.Success(data))
}

func GetPayTypeBar(c *gin.Context) {
	var query types.FlowParam
	if err := c.ShouldBindJSON(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = c.Request.Header.Get("bookKey")

	data := analysis.GetPayTypeBar(query)

	c.JSON(200, util.Success(data))
}

func MonthBar(c *gin.Context) {
	bookKey := c.Request.Header.Get("bookKey")

	data := analysis.MonthBar(bookKey)

	c.JSON(200, util.Success(data))
}
