package server

import (
	"cashbook-server/dao"
	"cashbook-server/types"
	"cashbook-server/util"
)

func GetServerInfo() types.Server {
	sqlGetServerInfo := `SELECT id, version, environment, create_date FROM server ;`

	rows, err := dao.db.Query(sqlGetServerInfo)
	util.CheckErr(err)

	var server types.Server
	if rows != nil {
		for rows.Next() {
			err = rows.Scan(&server.Id, &server.Version, &server.Environment, &server.CreateDate)
			util.CheckErr(err)
			break
		}
		err = rows.Close()
		util.CheckErr(err)
	}

	return server
}
