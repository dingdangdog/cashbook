package controller

import (
	sDict "cashbook-server/service/dict"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

// GetFlowType 获取流水类型
func GetFlowType(c *gin.Context) {
	bookId := util.GetBookId(c)
	data := sDict.GetFlowType(bookId)
	c.JSON(200, util.Success(data))
}

// GetExpenseType 获取流水类型下的消费类型
func GetExpenseType(c *gin.Context) {
	flowType := c.Param("flowType")
	bookId := util.GetBookId(c)
	data := sDict.GetExpenseType(bookId, flowType)
	c.JSON(200, util.Success(data))
}

// GetPaymentType 获取流水类型下的支付类型
func GetPaymentType(c *gin.Context) {
	flowType := c.Param("flowType")
	bookId := util.GetBookId(c)
	data := sDict.GetPaymentType(bookId, flowType)
	c.JSON(200, util.Success(data))
}

func GetAll(c *gin.Context) {
	typer := c.Query("type")
	name := c.Query("value")
	bookId := util.GetBookId(c)
	var data []types.Dict
	if typer == "消费类型" {
		data = sDict.GetExpenseType(bookId, "")
	} else if typer == "支付方式" {
		data = sDict.GetPaymentType(bookId, "")
	}

	var resultData []types.Dict
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
	var data types.Dict
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}

	bookId := util.GetBookId(c)
	data = sDict.UpdateType(data, bookId)
	c.JSON(200, util.Success(data))
}
