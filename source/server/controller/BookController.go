package controller

import (
	sBook "cashbook-server/service/book"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// CreateOrUpdateBook 创建或更新账本
func CreateOrUpdateBook(c *gin.Context) {
	var data types.Book
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	id := sBook.CreateOrUpdateBook(data)
	data.Id = id
	c.JSON(200, util.Success(data))
}

// DeleteBook 删除账本
func DeleteBook(c *gin.Context) {
	id := c.Param("id")
	intId, _ := strconv.ParseInt(id, 10, 64)
	sBook.DeleteBook(intId)

	c.JSON(200, util.Success("删除成功："+id))
}

// GetBookList 根据用户ID获取全部账本
func GetBookList(c *gin.Context) {
	token := c.Request.Header.Get("token")
	userId := util.GetUserId(token)
	data := sBook.GetBookList(userId)
	c.JSON(200, util.Success(data))
}
