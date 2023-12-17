package main

import (
	"cashbook-server/controller"
	"cashbook-server/util"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {

	router := gin.Default()
	api := router.Group("/api")
	api.GET("/server", controller.GetServerInfo)
	api.POST("/register", controller.Register)
	api.POST("/login", controller.Login)

	adminApi := api.Group("/admin")
	adminApi.Use(checkToken())
	{
		// 账本相关
		adminApi.GET("/book", controller.GetBookList)
		adminApi.POST("/book", controller.CreateBook)
		adminApi.PUT("/book/:id", controller.UpdateBook)
		adminApi.DELETE("/book/:id", controller.DeleteBook)

		// 字典相关
		adminApi.GET("/dict/:type", controller.GetDictList)
		adminApi.GET("/dict", controller.GetDictPage)
		adminApi.POST("/dict", controller.AddDict)
		adminApi.PUT("/dict/:id", controller.UpdateDict)
		adminApi.DELETE("/dict/:id", controller.DeleteDict)
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
		// 计划相关
		adminApi.GET("/plans/:month", controller.GetPlan)
		adminApi.POST("/plans/:overwrite", controller.SetPlan)
		// 在线同步相关
		adminApi.POST("/online/upload", controller.Upload)
		adminApi.POST("/online/download", controller.Download)
	}
	fmt.Println("-------- 服务启动成功：http://localhost:13303 --------")
	err := router.Run("0.0.0.0:13303")
	util.CheckErr(err)
}

// checkToken 校验token
func checkToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Request.Header.Get("token")
		if len(token) <= 0 {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success":      false,
				"errorMessage": "请先登录！",
			})
			c.Abort()
			return
		}
		if !util.IsTokenExpired(token) {
			c.Next()
			return
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success":      false,
				"errorMessage": "登录超时，请重新登录！",
			})
			c.Abort()
		}
	}
}
