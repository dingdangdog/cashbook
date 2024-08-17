package server

import (
	"cashbook-server/config"
	"cashbook-server/types"
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
	version := os.Getenv("CASHBOOK_VERSION")
	secret := os.Getenv("TOKEN_SALT")
	env := os.Getenv("ENVIRONMENT")
	return types.Server{Version: version, Secret: secret, Environment: env}
}

// GetServerInfo 获取服务信息
func GetServerInfo() types.Server {
	return serverInfo
}
