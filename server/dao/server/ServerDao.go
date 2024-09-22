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
	// return server
	if len(server.Version) <= 0 {
		server.Version = os.Getenv("CASHBOOK_VERSION")
	}
	if len(server.Secret) <= 0 {
		server.Secret = os.Getenv("TOKEN_SALT")
	}
	if len(server.Environment) <= 0 {
		server.Environment = os.Getenv("ENVIRONMENT")
	}
	return server
}

// GetServerInfo 获取服务信息
func GetServerInfo() types.Server {
	return serverInfo
}

func UpdateServerInfo(server types.Server) {
	serverInfo = server
	saveFile()
}

// 保存文件
func saveFile() {
	jsonData, _ := json.Marshal(serverInfo)
	_ = os.WriteFile(ConfigFile, jsonData, os.ModePerm)
}
