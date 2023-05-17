package main

import (
	"cashbook-server/controller"
	"cashbook-server/dao"
	"cashbook-server/util"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	dao.InitDb("./data", "cashbook.db")

	router := gin.Default()
	api := router.Group("/api")

	api.GET("/book/:key", controller.GetBook)
	api.POST("/book", controller.CreateBook)
	api.GET("/dist/:type", controller.GetDistList)
	api.GET("/server", controller.GetServerInfo)

	flowApi := api.Group("/flowApi")
	flowApi.Use(openBook())
	{
		flowApi.POST("/analysis/dailyLine", controller.GetDailyLine)
		flowApi.POST("/analysis/typePie", controller.GetTypePie)

		flowApi.GET("/flow/getAll", controller.GetAll)
		flowApi.GET("/flow", controller.GetFlowsPage)
		flowApi.POST("/flow", controller.CreateFlow)
		flowApi.PUT("/flow/:id", controller.UpdateFlow)
		flowApi.DELETE("/flow/:id", controller.DeleteFlow)
	}
	fmt.Println("-------- 服务启动成功：http://localhost:13303 --------")
	err := router.Run(":13303")
	util.CheckErr(err)
}

func openBook() gin.HandlerFunc {
	return func(c *gin.Context) {
		bookKey := c.Request.Header.Get("bookKey")
		if 0 == len(bookKey) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success":      false,
				"errorMessage": "请输入账本密钥！",
			})
			c.Abort()
			return
		}

		if nil == dao.GetBook(bookKey) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success":      false,
				"errorMessage": "账本不存在！",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
