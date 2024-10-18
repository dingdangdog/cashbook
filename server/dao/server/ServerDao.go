package server

import (
	"cashbook-server/config"
	"cashbook-server/types"
	"encoding/json"
	"fmt"
	"os"
)

const ConfigFile = config.ConfigPath + "server.json"
const PublicConfigFile = config.DataPath + "config.json"

func init() {
	// 初始化公开配置
	loadPublicConfig()
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
	if len(server.Environment) <= 0 {
		server.Environment = os.Getenv("ENVIRONMENT")
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
	if len(server.Public.Version) <= 0 {
		server.Public.Version = os.Getenv("CASHBOOK_VERSION")
	}
	saveFile(server)
	return server
}

func loadPublicConfig() types.PublicConfig {
	fileBytes, _ := os.ReadFile(PublicConfigFile)
	var publicConfig types.PublicConfig
	if len(fileBytes) != 0 {
		if err := json.Unmarshal(fileBytes, &publicConfig); err != nil {
			return types.PublicConfig{}
		}
		fmt.Println("publicConfig read")
	} else {
		server := loadConfig()
		publicConfig = server.Public
		savePublicConfig(publicConfig)
		fmt.Println("publicConfig init")
	}
	return publicConfig
}

// GetServer 获取服务信息--服务端使用
func GetServer() types.Server {
	server := loadConfig()
	return server
}

// 客户端使用
func GetServerInfo() types.PublicConfig {
	return loadPublicConfig()
}

func UpdateServerInfo(server types.PublicConfig) {
	savePublicConfig(server)
}

// 保存文件
func saveFile(server types.Server) {
	jsonData, _ := json.Marshal(server)
	_ = os.WriteFile(ConfigFile, jsonData, os.ModePerm)
}

// 保存配置文件
func savePublicConfig(server types.PublicConfig) {
	jsonData, _ := json.Marshal(server)
	_ = os.WriteFile(PublicConfigFile, jsonData, os.ModePerm)
}
