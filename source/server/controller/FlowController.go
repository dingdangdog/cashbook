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

// AddFlow 新增流水
func AddFlow(c *gin.Context) {
	var data types.Flow
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}
	data.BookKey = sessions.Default(c).Get("bookKey").(string)

	id := dao.CreateFlow(data)
	data.Id = id
	c.JSON(200, util.Success(data))

	go dao.UpdatePlanUsed(data.BookKey)
}

// UpdateFlow 更新流水
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

	data.BookKey = sessions.Default(c).Get("bookKey").(string)
	id := c.Param("id")
	num, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	data.Id = num
	dao.UpdateFlow(data)

	c.JSON(200, util.Success(data))

	go dao.UpdatePlanUsed(data.BookKey)
}

// DeleteFlow 删除流水
func DeleteFlow(c *gin.Context) {
	id := c.Param("id")
	num, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	dao.DeleteFlow(num)

	c.JSON(200, util.Success("删除成功："+id))

	bookKey := sessions.Default(c).Get("bookKey").(string)
	go dao.UpdatePlanUsed(bookKey)
}

// GetFlowsPage 分页获取流水数据
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

	query.BookKey = sessions.Default(c).Get("bookKey").(string)

	page := dao.GetFlowsPage(query)

	c.JSON(200, util.Success(page))
}

func GetAll(c *gin.Context) {
	bookKey := sessions.Default(c).Get("bookKey").(string)
	data := dao.GetAll(bookKey)

	c.JSON(200, util.Success(data))
}

// ImportFlows 导入流水（json文件）
func ImportFlows(c *gin.Context) {
	var data types.FlowsImport

	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	// flag = overwrite || add
	flag := c.Query("flag")

	if len(flag) == 0 {
		c.JSON(500, util.Error("导入失败，数据异常", nil))
		return
	}
	if len(data.Flows) == 0 {
		c.JSON(500, util.Error("导入失败，导入数据为空", nil))
		return
	}

	bookKey := sessions.Default(c).Get("bookKey").(string)

	nums := dao.ImportFlows(bookKey, flag, data.Flows)

	if nums == 0 {
		c.JSON(500, util.Error("导入失败，请重试", nil))
		return
	}
	c.JSON(200, util.Success(nums))

	go dao.UpdatePlanUsed(bookKey)
}
