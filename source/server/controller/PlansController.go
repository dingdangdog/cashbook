package controller

import (
	"cashbook-server/dao"
	"cashbook-server/types"
	"cashbook-server/util"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
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
	data.BookKey = sessions.Default(c).Get("bookKey").(string)

	if overwrite == "1" {
		dao.UpdatePlan(data)
	} else {
		dao.SetPlan(data)
		go dao.UpdatePlanUsed(data.BookKey)
	}

	c.JSON(200, util.Success(data))
}

func GetPlan(c *gin.Context) {
	month := c.Param("month")

	bookKey := sessions.Default(c).Get("bookKey").(string)
	plan := dao.GetPlan(bookKey, month)

	c.JSON(200, util.Success(plan))
}

func UpdatePlans(c *gin.Context) {
	bookKey := sessions.Default(c).Get("bookKey").(string)
	go dao.UpdatePlanUsed(bookKey)
	c.JSON(200, util.Success(bookKey))
}
