package book

import (
	"cashbook-server/types"
	"encoding/json"
	"fmt"
)

const Config = "{" +
	"\"version\": \"1.1.6\", " +
	"\"environment\": \"personal\", " +
	"\"serverPath\": \".\", " +
	"\"secret\": \"spend-money-like-water\"" +
	"}"

var serverInfo types.Server

// 初始化数据
func init() {
	fmt.Println("------ Loading server ------")
	serverInfo = loadConfig()
	fmt.Println("------ Loaded server ------")
}

// 加载文件
func loadConfig() types.Server {
	var server types.Server
	if err := json.Unmarshal([]byte(Config), &server); err != nil {
		return types.Server{}
	}
	return server
}

// GetServerInfo 获取服务信息
func GetServerInfo() types.Server {
	return serverInfo
}
