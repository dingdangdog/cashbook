package controller

import (
	"cashbook-server/dao"
	"cashbook-server/types"
	"cashbook-server/util"
	"net/http"

	"github.com/gin-gonic/gin"
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

func GetBookList(c *gin.Context) {
	data := dao.GetBookList()
	c.JSON(200, util.Success(data))
}

func GetBook(c *gin.Context) {
	bookKey := c.Param("key")
	data := dao.GetBook(bookKey)

	if data.Id == 0 {
		c.JSON(200, util.Error("账本不存在！", nil))
	} else {
		c.JSON(200, util.Success(data))

		dao.CheckAndInitBookDist(bookKey)
	}
}

func ChangeKey(c *gin.Context) {
	var data types.ChangeBookKey
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	data.OldKey = c.Request.Header.Get("bookKey")

	id := dao.ChangeKey(data)
	if id == 0 {
		c.JSON(200, util.Error("修改失败，可能存在相同密钥，请修改后再试", nil))
	} else {
		c.JSON(200, util.Success(data))
	}
}
