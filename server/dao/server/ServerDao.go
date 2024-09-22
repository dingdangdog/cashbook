package server

import (
	"cashbook-server/config"
	"cashbook-server/types"
	"encoding/json"
	"os"
)

const ConfigFile = config.ConfigPath + "server.json"

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
	if len(server.Environment) <= 0 {
		server.Environment = os.Getenv("ENVIRONMENT")
	}
	if len(server.Mod) <= 0 {
		server.Mod = os.Getenv("MOD")
	}
	if len(server.Salt) <= 0 {
		server.Salt = os.Getenv("TOKEN_SALT")
	}
	if len(server.Key) <= 0 {
		server.Key = os.Getenv("SERVER_KEY")
	}
	if len(server.Password) <= 0 {
		server.Password = os.Getenv("DEFAULT_PASSWORD")
	}
	return server
}

// GetServer 获取服务信息--服务端使用
func GetServer() types.Server {
	server := loadConfig()
	return server
}

// 客户端使用
func GetServerInfo() types.Server {
	server := loadConfig()
	server.Key = ""
	server.Salt = ""
	server.Password = ""
	return server
}

func UpdateServerInfo(server types.Server) {
	s := GetServer()
	s.OpenRegister = server.OpenRegister

	saveFile(s)
}

// 保存文件
func saveFile(server types.Server) {
	jsonData, _ := json.Marshal(server)
	_ = os.WriteFile(ConfigFile, jsonData, os.ModePerm)
}
