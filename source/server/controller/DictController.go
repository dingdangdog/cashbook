package controller

import (
	sDict "cashbook-server/service/dict"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
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
