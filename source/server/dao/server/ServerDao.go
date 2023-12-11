package book

import (
	"cashbook-server/types"
	"encoding/json"
	"fmt"
	"os"
)

// FileName 文件名称
const FileName = "./resources/config/server.json"

var serverStatic []types.Server

var lastId int64

// 初始化数据
func init() {
	fmt.Println("------ Loading serverStatic ------")
	serverStatic = loadFile()
	fmt.Println("------ Loaded serverStatic ------")
}

// 加载文件
func loadFile() []types.Server {
	fileBytes, _ := os.ReadFile(FileName)
	var servers []types.Server
	if len(fileBytes) != 0 {
		if err := json.Unmarshal(fileBytes, &servers); err != nil {
			return nil
		}
	}
	return servers
}

// 保存文件
func saveFile() {
	jsonData, _ := json.Marshal(serverStatic)
	_ = os.WriteFile(FileName, jsonData, os.ModePerm)
}
