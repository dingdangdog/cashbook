package user

import (
	"cashbook-server/dao/book"
	"cashbook-server/dao/user"
	"cashbook-server/types"
	"cashbook-server/util"
	"errors"
)

// Register 注册
func Register(u types.User) int64 {
	u.Password = util.EncryptBySHA256(u.UserName, u.Password)
	us := user.FindUsers(types.User{UserName: u.UserName})
	if len(us) > 0 {
		return -1
	}
	return user.AddOrUpdate(u)
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
		loginfo.Background = users[0].Background
	} else {
		// throw error
		loginfo.Token = "error"
		return loginfo, errors.New("用户名或密码错误")
	}
	return loginfo, nil
}

// CheckPassword /* 校验密码是否正确 */
func CheckPassword(id int64, password string) bool {
	us := user.FindUsers(types.User{Id: id})
	if len(us) <= 0 {
		return false
	}
	return util.EncryptBySHA256(us[0].UserName, password) == us[0].Password
}

// ChangePassword /* 修改密码 */
func ChangePassword(id int64, password string) bool {
	us := user.FindUsers(types.User{Id: id})
	if len(us) <= 0 {
		return false
	}
	u := us[0]
	u.Password = util.EncryptBySHA256(us[0].UserName, password)
	user.Delete(id)
	user.AddOrUpdate(u)
	return true
}

func SetBackground(id int64, background string) bool {
	u := user.FindUserById(id)
	if u.Id <= 0 {
		return false
	}
	u.Background = background
	user.Delete(id)
	user.AddOrUpdate(u)
	return true
}

func CheckUser(userId int64, bookId int64) map[string]string {
	userBookMap := make(map[string]string)
	u := user.FindUserById(userId)
	if u.Id <= 0 {
		userBookMap["user"] = "none"
	} else {
		userBookMap["user"] = "have"
	}
	b := book.GetOneById(bookId)
	if b.Id <= 0 {
		userBookMap["book"] = "none"
	} else {
		userBookMap["book"] = "have"
	}

	return userBookMap
}
