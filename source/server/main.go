package main

import (
	"cashbook-server/controller"
	"cashbook-server/util"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	// 打开或创建日志文件
	file, err := os.OpenFile("./cashbook.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		fmt.Println("Error opening log file:", err)
		return
	}
	defer func(file *os.File) {
		err = file.Close()
		util.CheckErr(err)
	}(file)

	// 重定向标准输出到文件
	os.Stdout = file

	router := gin.Default()
	api := router.Group("/api")
	api.GET("/server", controller.GetServerInfo)
	api.POST("/register", controller.Register)
	api.POST("/login", controller.Login)

	adminApi := api.Group("/admin")
	adminApi.Use(checkToken())
	{
		// 用户相关
		adminApi.POST("/checkPassword/:password", controller.CheckPassword)
		adminApi.POST("/changePassword", controller.ChangePassword)
		adminApi.GET("/setBackground", controller.SetBackground)

		// 账本相关
		adminApi.GET("/book", controller.GetBookList)
		adminApi.POST("/book", controller.CreateBook)
		adminApi.POST("/book/openBook", controller.OpenBook)
		adminApi.PUT("/book/:id", controller.UpdateBook)
		adminApi.DELETE("/book/:id", controller.DeleteBook)

		// 字典相关
		adminApi.GET("/dict/getFlowType", controller.GetFlowType)
		adminApi.GET("/dict/getExpenseType/:flowType", controller.GetExpenseType)
		adminApi.GET("/dict/getPaymentType/:flowType", controller.GetPaymentType)
		adminApi.GET("/dict/getAll", controller.GetAll)
		adminApi.POST("/dict/update", controller.UpdateType)
		// 映射关系维护
		adminApi.GET("/type/getTypeRelation", controller.GetTypeRelation)
		adminApi.POST("/type/updateTypeRelation", controller.UpdateTypeRelation)

		// 分析图表相关
		adminApi.POST("/analysis/dailyLine", controller.GetDailyLine)
		adminApi.POST("/analysis/typePie", controller.GetTypePie)
		adminApi.POST("/analysis/payTypeBar", controller.GetPayTypeBar)
		adminApi.POST("/analysis/monthBar", controller.MonthBar)
		// 流水相关
		adminApi.GET("/flow/getAll", controller.GetBookAll)
		adminApi.POST("/flow/importFlows", controller.ImportFlows)
		adminApi.GET("/flow", controller.GetFlowsPage)
		adminApi.POST("/flow", controller.AddFlow)
		adminApi.PUT("/flow/:id", controller.UpdateFlow)
		adminApi.DELETE("/flow/:id", controller.DeleteFlow)
		adminApi.DELETE("/flow/deleteFlows", controller.DeleteFlows)
		// 计划相关
		adminApi.GET("/plans/:month", controller.GetPlan)
		adminApi.POST("/plans/:overwrite", controller.SetPlan)
		// 在线同步相关
		adminApi.POST("/online/upload", controller.Upload)
		adminApi.POST("/online/download", controller.Download)
	}
	fmt.Println("-------- 服务启动成功：http://localhost:13303 --------")
	err = router.Run("0.0.0.0:13303")
	util.CheckErr(err)
}

// checkToken 校验token
func checkToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Request.Header.Get("token")
		if len(token) <= 0 {
			c.JSON(http.StatusUnauthorized, util.Error("请先登录！", nil))
			c.Abort()
			return
		}
		if !util.IsTokenExpired(token) {
			c.Next()
			return
		} else {
			c.JSON(http.StatusUnauthorized, util.Error("登录超时，请重新登录！", nil))
			c.Abort()
		}
	}
}
