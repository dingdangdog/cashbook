package controller

import (
	sDict "cashbook-server/service/dict"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// GetDictList 获取字典列表
func GetDictList(c *gin.Context) {
	dictType := c.Param("type")
	bookId := util.GetBookId(c)

	data := sDict.GetDictList(bookId, dictType)

	c.JSON(200, util.Success(data))
}

// GetDictPage 获取字典分页
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

	page := sDict.GetDictPage(query)

	c.JSON(200, util.Success(page))
}

// AddDict 添加字典
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

	id := sDict.AddOrUpdateDict(data)
	data.Id = id
	c.JSON(200, util.Success(data))
}

// UpdateDict 更新字典
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
	idNum, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	data.Id = idNum
	sDict.AddOrUpdateDict(data)

	c.JSON(200, util.Success(data))
}

// DeleteDict 删除字典
func DeleteDict(c *gin.Context) {
	id := c.Param("id")
	idNum, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	sDict.DeleteDict(idNum)

	c.JSON(200, util.Success("删除成功："+id))
}
