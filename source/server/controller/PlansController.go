package controller

import (
	"cashbook-server/service/plan"
	"cashbook-server/types"
	"cashbook-server/util"
	"github.com/gin-gonic/gin"
	"net/http"
)

func SetPlan(c *gin.Context) {
	overwrite := c.Param("overwrite")

	var data types.Plan
	if err := c.ShouldBindJSON(&data); err != nil {
		util.CheckErr(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success":      false,
			"errorMessage": err.Error(),
		})
		return
	}
	data.BookKey = c.Request.Header.Get("bookKey")

	if overwrite == "1" {
		plan.UpdatePlan(data)
	} else {
		plan.SetPlan(data)
		go plan.UpdatePlanUsed(data.BookKey)
	}

	c.JSON(200, util.Success(data))
}

func GetPlan(c *gin.Context) {
	month := c.Param("month")

	bookKey := c.Request.Header.Get("bookKey")
	data := plan.GetPlan(bookKey, month)

	c.JSON(200, util.Success(data))
}
