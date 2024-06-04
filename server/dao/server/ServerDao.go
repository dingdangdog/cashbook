package server

import (
	"cashbook-server/config"
	"cashbook-server/types"
	"encoding/json"
	"fmt"
	"os"
)

const ConfigFile = config.ConfigPath + "server.json"

var serverInfo types.Server

// 初始化数据
func init() {
	fmt.Println("------ Loading server ------")
	serverInfo = loadConfig()
	fmt.Println("------ Loaded server ------")
}

// 加载文件
func loadConfig() types.Server {
	fileBytes, _ := os.ReadFile(ConfigFile)
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
