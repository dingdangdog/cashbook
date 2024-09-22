package server

import (
	dServer "cashbook-server/dao/server"
	"cashbook-server/types"
)

func GetServerInfo() types.Server {
	return dServer.GetServerInfo()
}

func UpdateServerInfo(server types.Server) {
	dServer.UpdateServerInfo(server)
}
