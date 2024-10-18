package server

import (
	dServer "cashbook-server/dao/server"
	"cashbook-server/types"
)

func GetServer() types.Server {
	return dServer.GetServer()
}

func GetServerInfo() types.PublicConfig {
	return dServer.GetServerInfo()
}

func UpdateServerInfo(server types.PublicConfig) {
	dServer.UpdateServerInfo(server)
}
