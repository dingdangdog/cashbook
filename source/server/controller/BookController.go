package controller

import (
	sBook "cashbook-server/service/book"
	sFlow "cashbook-server/service/flow"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// CreateBook 创建账本
func CreateBook(c *gin.Context) {
	var data types.Book
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}
	userId := util.GetUserId(c)
	data.UserId = userId

	id := sBook.CreateOrUpdateBook(data)
	data.Id = id

	c.JSON(200, util.Success(data))
}

// UpdateBook 更新账本
func UpdateBook(c *gin.Context) {
	var data types.Book
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	id := c.Param("id")
	idNum, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	data.Id = idNum
	sBook.CreateOrUpdateBook(data)
	c.JSON(200, util.Success(data))
}

// DeleteBook 删除账本
func DeleteBook(c *gin.Context) {
	id := c.Param("id")
	intId, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	sBook.DeleteBook(intId)

	c.JSON(200, util.Success("删除成功："+id))
}

// GetBookList 根据用户ID获取全部账本
func GetBookList(c *gin.Context) {
	userId := util.GetUserId(c)
	data := sBook.GetBookList(userId)
	c.JSON(200, util.Success(data))
}

func OpenBook(c *gin.Context) {
	bookId := util.GetBookId(c)
	sFlow.InitFlows(bookId)
	c.JSON(200, util.Success("账本已打开"))
}
