package controller

import (
	"cashbook-server/config"
	"cashbook-server/service/flow"
	"cashbook-server/service/plan"
	"cashbook-server/types"
	"cashbook-server/util"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
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
	bookId := util.GetBookId(c)
	flow.DeleteFlow(idNum, bookId)
	// 更新计划中本月已用金额
	go plan.UpdatePlanUsed(bookId)
	c.JSON(200, util.Success("删除成功："+id))
}

// DeleteFlows 删除流水
func DeleteFlows(c *gin.Context) {
	var data map[string][]int64
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}
	bookId := util.GetBookId(c)
	flow.DeleteFlows(data["ids"], bookId)
	// 更新计划中本月已用金额
	go plan.UpdatePlanUsed(bookId)
	c.JSON(200, util.Success("删除成功："+strconv.Itoa(len(data["ids"]))))
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

	query.BookId = util.GetBookId(c)

	page := flow.GetFlowsPage(query)

	c.JSON(200, util.Success(page))
}

func GetBookAll(c *gin.Context) {
	bookId := util.GetBookId(c)
	data := flow.GetBookAll(bookId)

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

	bookId := util.GetBookId(c)
	nums := flow.ImportFlows(flag, data.Flows, bookId)

	if nums == 0 {
		c.JSON(500, util.Error("导入失败，请重试", nil))
		return
	}
	c.JSON(200, util.Success(nums))

	go plan.UpdatePlanUsed(bookId)
}

func UploadInvoice(c *gin.Context) {
	// 从请求中获取上传的文件
	id := c.PostForm("id")
	file, err := c.FormFile("invoice")
	if err != nil {
		c.JSON(500, util.Error("获取图片失败", err.Error()))
		return
	}
	ext := filepath.Ext(file.Filename) // 获取文件扩展名
	fileName := id + ext
	// 指定保存文件的路径（你可以自定义路径）
	filePath := filepath.Join(config.ImagePath, fileName)

	// 将图片保存到指定的路径
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("保存图片失败: %s", err.Error()))
		return
	}
	bookId := util.GetBookId(c)
	flowId, err := strconv.ParseInt(id, 10, 64)
	util.CheckErr(err)
	// 保存文件名到流水信息中
	flow.UploadInvoice(bookId, flowId, fileName)

	c.JSON(200, util.Success("上传成功"))
}

func ShowInvoice(c *gin.Context) {
	invoice := c.Query("invoice")
	// 拼接图片的完整路径，假设图片保存在 invoices/ 目录下
	imagePath := filepath.Join(config.ImagePath, invoice)

	// 检查文件是否存在
	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
		c.JSON(500, util.Error("图片不存在", ""))
		return
	}

	// 设置响应头，告知客户端这是图片类型
	c.Writer.Header().Set("Content-Type", "application/octet-stream") // 根据实际图片类型设置
	c.File(imagePath)                                                 // 将图片文件发送给客户端
}
