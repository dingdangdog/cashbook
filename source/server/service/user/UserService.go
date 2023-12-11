package user

import (
	"cashbook-server/dao/user"
	"cashbook-server/types"
	"cashbook-server/util"
)

// Login 登录
func Login(u types.User) types.LogInfo {
	loginfo := types.LogInfo{}
	users := user.FindUsers(u)
	if len(users) == 1 {
		token, _ := util.GenerateToken(users[0])
		loginfo.Token = token
		loginfo.Id = users[0].Id
	} else {
		// throw error
		loginfo.Token = "error"
	}
	return loginfo
}
