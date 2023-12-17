package controller

import (
	"cashbook-server/service/analysis"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
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

	bookId := c.Request.Header.Get("bookId")
	bookIdNum, err := strconv.ParseInt(bookId, 10, 64)
	util.CheckErr(err)
	query.BookId = bookIdNum

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

	bookId := c.Request.Header.Get("bookId")
	bookIdNum, err := strconv.ParseInt(bookId, 10, 64)
	util.CheckErr(err)
	query.BookId = bookIdNum

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
	bookId := c.Request.Header.Get("bookId")
	bookIdNum, err := strconv.ParseInt(bookId, 10, 64)
	util.CheckErr(err)
	query.BookId = bookIdNum

	data := analysis.GetPayTypeBar(query)

	c.JSON(200, util.Success(data))
}

func MonthBar(c *gin.Context) {
	bookId := c.Request.Header.Get("bookId")
	bookIdNum, err := strconv.ParseInt(bookId, 10, 64)
	util.CheckErr(err)

	data := analysis.MonthBar(bookIdNum)

	c.JSON(200, util.Success(data))
}
