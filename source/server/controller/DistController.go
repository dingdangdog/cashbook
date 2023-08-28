package controller

import (
	"cashbook-server/dao"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"github.com/gin-contrib/sessions"
)

func GetDistList(c *gin.Context) {
	Type := c.Param("type")
	bookKey := sessions.Default(c).Get("bookKey").(string)

	dao.CheckAndInitBookDist(bookKey)

	data := dao.GetDistList(bookKey, Type)

	c.JSON(200, util.Success(data))

}

func GetDistPage(c *gin.Context) {
	var query types.DistQuery
	if err := c.BindQuery(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	query.BookKey = sessions.Default(c).Get("bookKey").(string)
	page := dao.GetDistPage(query)

	c.JSON(200, util.Success(page))
}

func AddDist(c *gin.Context) {
	var data types.Dist
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	data.BookKey = sessions.Default(c).Get("bookKey").(string)

	id := dao.AddDist(data)
	data.Id = id
	c.JSON(200, util.Success(data))
}

func UpdateDist(c *gin.Context) {
	var data types.Dist

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

	data.BookKey = sessions.Default(c).Get("bookKey").(string)
	dao.UpdateDist(data)

	c.JSON(200, util.Success(data))
}

func DeleteDist(c *gin.Context) {
	id := c.Param("id")
	num, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	dao.DeleteDist(num)

	c.JSON(200, util.Success("删除成功："+id))
}
