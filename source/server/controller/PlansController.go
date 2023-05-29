package controller

import (
	"cashbook-server/dao"
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

	if overwrite == "1" {
		dao.UpdatePlan(data)
	} else {
		dao.SetPlan(data)
	}

	c.JSON(200, util.Success(data))
}

func GetPlan(c *gin.Context) {
	month := c.Param("month")

	plan := dao.GetPlan(month)

	c.JSON(200, util.Success(plan))
}
