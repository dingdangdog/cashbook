package controller

import (
	"cashbook-server/dao"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
)

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

	id := dao.CreateBook(data)
	data.Id = id
	c.JSON(200, util.Success(data))
}

func GetBook(c *gin.Context) {
	bookKey := c.Param("key")
	data := dao.GetBook(bookKey)

	c.JSON(200, util.Success(data))
}
