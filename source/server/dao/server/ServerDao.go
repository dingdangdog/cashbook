package book

import (
	"cashbook-server/types"
	"encoding/json"
	"fmt"
	"os"
)

// FileName 文件名称
const FileName = "./resources/config/server.json"

var serverInfo types.Server

// 初始化数据
func init() {
	fmt.Println("------ Loading server ------")
	serverInfo = loadFile()
	fmt.Println("------ Loaded server ------")
}

// 加载文件
func loadFile() types.Server {
	fileBytes, _ := os.ReadFile(FileName)
	var server types.Server
	if len(fileBytes) != 0 {
		if err := json.Unmarshal(fileBytes, &server); err != nil {
			return types.Server{}
		}
	}
	return server
}

// GetServerInfo 获取服务信息
func GetServerInfo() types.Server {
	return serverInfo
}
