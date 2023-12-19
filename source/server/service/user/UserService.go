package user

import (
	"cashbook-server/dao/user"
	"cashbook-server/types"
	"cashbook-server/util"
	"errors"
)

// Register 注册
func Register(u types.User) int64 {
	u.Password = util.EncryptBySHA256(u.UserName, u.Password)
	return user.AddUser(u)
}

// Login 登录
func Login(rememberFlag bool, u types.User) (types.LogInfo, error) {
	loginfo := types.LogInfo{}
	u.Password = util.EncryptBySHA256(u.UserName, u.Password)
	users := user.FindUsers(u)
	if len(users) == 1 {
		token, _ := util.GenerateToken(rememberFlag, users[0])
		loginfo.Token = token
		loginfo.Id = users[0].Id
		loginfo.Name = users[0].Name
	} else {
		// throw error
		loginfo.Token = "error"
		return loginfo, errors.New("用户名或密码错误")
	}
	return loginfo, nil
}
