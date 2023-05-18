package controller

import (
	"cashbook-server/dao"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

func CreateFlow(c *gin.Context) {
	var data types.Flow
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}
	data.BookKey = c.Request.Header.Get("bookKey")

	id := dao.CreateFlow(data)
	data.Id = id
	c.JSON(200, util.Success(data))
}

func UpdateFlow(c *gin.Context) {
	var data types.Flow

	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	data.BookKey = c.Request.Header.Get("bookKey")
	id := c.Param("id")
	num, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	data.Id = num
	dao.UpdateFlow(data)

	c.JSON(200, util.Success(data))
}

func DeleteFlow(c *gin.Context) {
	id := c.Param("id")
	num, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	dao.DeleteFlow(num)

	c.JSON(200, util.Success("删除成功："+id))
}

func GetFlowsPage(c *gin.Context) {
	var query types.FlowQuery
	if err := c.BindQuery(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = c.Request.Header.Get("bookKey")

	page := dao.GetFlowsPage(query)

	c.JSON(200, util.Success(page))
}

func GetAll(c *gin.Context) {
	bookKey := c.Param("bookKey")
	data := dao.GetAll(bookKey)

	c.JSON(200, util.Success(data))
}
