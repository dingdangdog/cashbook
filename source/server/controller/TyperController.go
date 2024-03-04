package controller

import (
	sTyper "cashbook-server/service/typer"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

// GetFlowType 获取流水类型
func GetFlowType(c *gin.Context) {
	bookId := util.GetBookId(c)
	data := sTyper.GetFlowType(bookId)
	c.JSON(200, util.Success(data))
}

// GetExpenseType 获取流水类型下的消费类型
func GetExpenseType(c *gin.Context) {
	flowType := c.Param("flowType")
	bookId := util.GetBookId(c)
	data := sTyper.GetExpenseType(bookId, flowType)
	c.JSON(200, util.Success(data))
}

// GetPaymentType 获取流水类型下的支付类型
func GetPaymentType(c *gin.Context) {
	flowType := c.Param("flowType")
	bookId := util.GetBookId(c)
	data := sTyper.GetPaymentType(bookId, flowType)
	c.JSON(200, util.Success(data))
}

func GetAll(c *gin.Context) {
	typer := c.Query("type")
	name := c.Query("value")
	bookId := util.GetBookId(c)
	var data []types.Typer
	if typer == "消费类型" {
		data = sTyper.GetExpenseType(bookId, "")
	} else if typer == "支付方式" {
		data = sTyper.GetPaymentType(bookId, "")
	} else {
		eData := sTyper.GetExpenseType(bookId, "")
		pData := sTyper.GetPaymentType(bookId, "")
		data = append(data, eData...)
		data = append(data, pData...)
	}

	// 查询条件：按名称过滤
	var resultData []types.Typer
	for _, value := range data {
		if len(name) > 0 && strings.Contains(value.Value, name) {
			resultData = append(resultData, value)
		} else if len(name) <= 0 {
			resultData = append(resultData, value)
		}
	}

	c.JSON(200, util.Success(resultData))
}

func UpdateType(c *gin.Context) {
	var data types.Typer
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	bookId := util.GetBookId(c)
	num := sTyper.UpdateType(data, bookId)
	c.JSON(200, util.Success(num))
}
