package controller

import (
	"cashbook-server/service/flow"
	"cashbook-server/service/plan"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
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

	id := flow.AddFlow(data)
	data.Id = id
	c.JSON(200, util.Success(data))

	go plan.UpdatePlanUsed(data.BookId)
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

	id := c.Param("id")
	num, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	data.Id = num
	flow.UpdateFlow(data)

	c.JSON(200, util.Success(data))

	go plan.UpdatePlanUsed(data.BookId)
}

// DeleteFlow 删除流水
func DeleteFlow(c *gin.Context) {
	id := c.Param("id")
	idNum, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	bookId := c.Param("bookId")
	bookIdNum, err := strconv.ParseInt(bookId, 10, 64)
	util.CheckErr(err)

	flow.DeleteFlow(idNum, bookIdNum)
	go plan.UpdatePlanUsed(bookIdNum)
	c.JSON(200, util.Success("删除成功："+id))
}

// GetFlowsPage 分页获取流水数据
func GetFlowsPage(c *gin.Context) {
	var query types.FlowParam
	if err := c.BindQuery(&query); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	page := flow.GetFlowsPage(query)

	c.JSON(200, util.Success(page))
}

func GetBookAll(c *gin.Context) {
	bookId := c.Param("bookId")
	bookIdNum, err := strconv.ParseInt(bookId, 10, 64)
	util.CheckErr(err)
	data := flow.GetBookAll(bookIdNum)

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

	nums := flow.ImportFlows(flag, data.Flows)

	if nums == 0 {
		c.JSON(500, util.Error("导入失败，请重试", nil))
		return
	}
	c.JSON(200, util.Success(nums))

	go plan.UpdatePlanUsed(data.Flows[0].BookId)
}
