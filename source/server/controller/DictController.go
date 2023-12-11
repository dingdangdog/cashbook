package controller

import (
	sDict "cashbook-server/service/dict"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

func GetDictList(c *gin.Context) {
	dictType := c.Param("type")
	bookKey := c.Request.Header.Get("bookKey")

	sDict.CheckAndInitBookDict(bookKey)

	data := sDict.GetDictList(bookKey, dictType)

	c.JSON(200, util.Success(data))

}

func GetDictPage(c *gin.Context) {
	var query types.DictParam
	if err := c.BindQuery(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = c.Request.Header.Get("bookKey")
	page := sDict.GetDictPage(query)

	c.JSON(200, util.Success(page))
}

func AddDict(c *gin.Context) {
	var data types.Dict
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	data.BookKey = c.Request.Header.Get("bookKey")

	id := sDict.AddDict(data)
	data.Id = id
	c.JSON(200, util.Success(data))
}

func UpdateDict(c *gin.Context) {
	var data types.Dict

	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	id := c.Param("id")
	num, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	data.Id = num

	data.BookKey = c.Request.Header.Get("bookKey")
	sDict.UpdateDict(data)

	c.JSON(200, util.Success(data))
}

func DeleteDict(c *gin.Context) {
	id := c.Param("id")
	num, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	sDict.DeleteDict(num)

	c.JSON(200, util.Success("删除成功："+id))
}
