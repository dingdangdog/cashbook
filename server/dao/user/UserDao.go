package user

import (
	"cashbook-server/config"
	"cashbook-server/types"
	"cashbook-server/util"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

// FileName 文件名称
const FileName = config.DataPath + "user.json"

//const FileName = "./data/user.json"

var userStatic []types.User

var lastId int64

// 初始化数据
func init() {
	fmt.Println("------ Loading userStatic ------")
	userStatic = loadFile()
	initLastId()
	fmt.Println("------ Loaded userStatic ------")
}

// 加载文件
func loadFile() []types.User {
	fileBytes, _ := os.ReadFile(FileName)
	var users []types.User
	if len(fileBytes) != 0 {
		if err := json.Unmarshal(fileBytes, &users); err != nil {
			return nil
		}
	}
	return users
}

// GetAll 获取全部用户
func GetAll() []types.User {
	return userStatic
}

// 保存文件
func saveFile() {
	jsonData, _ := json.Marshal(userStatic)
	err := os.WriteFile(FileName, jsonData, os.ModePerm)
	util.CheckErr(err)
}

// AddOrUpdate 添加数据
func AddOrUpdate(user types.User) int64 {
	if user.Id == 0 {
		user.Id = getNextId()
	}
	userStatic = append(userStatic, user)
	saveFile()
	return user.Id
}

// 初始化获取最大的ID
func initLastId() {
	lastId = 0
	if len(userStatic) > 0 {
		for _, u := range userStatic {
			if lastId < u.Id {
				lastId = u.Id
			}
		}
	}
}

// 获取下一个ID
func getNextId() int64 {
	lastId = lastId + 1
	return lastId
}

// Delete 按照ID删除数据
func Delete(id int64) {
	var index int64
	var flag = false
	if len(userStatic) > 0 {
		for i, u := range userStatic {
			if id == u.Id {
				index = int64(i)
				flag = true
			}
		}
	}
	if flag {
		userStatic = append(userStatic[:index], userStatic[index+1:]...)
		saveFile()
	}
}

// FindUsers 条件查询：按条件筛选数据，返回符合条件的数据
func FindUsers(u types.User) []types.User {
	uQuery := getQuery(u)

	var results []types.User
	if len(userStatic) > 0 {
		for _, ui := range userStatic {
			// 字符串模糊
			var flag = true
			if uQuery.ID {
				flag = ui.Id == u.Id
			}
			if flag && uQuery.UserName {
				flag = strings.Contains(ui.UserName, u.UserName)
			}
			if flag && uQuery.Password {
				flag = ui.Password == u.Password
			}
			if flag {
				results = append(results, ui)
			}
		}
	}
	return results
}

func FindUserById(id int64) types.User {
	if len(userStatic) > 0 {
		for _, ui := range userStatic {
			// 字符串模糊
			if ui.Id == id {
				return ui
			}
		}
	}
	return types.User{}
}

// 查询条件前置判断，明确哪些条件需要判断
func getQuery(u types.User) types.UserQuery {
	var uQuery types.UserQuery
	uQuery.ID = u.Id > 0
	uQuery.Name = len(u.Name) > 0
	uQuery.UserName = len(u.UserName) > 0
	uQuery.Password = len(u.Password) > 0
	return uQuery
}
