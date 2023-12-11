package book

import (
	"cashbook-server/types"
	"encoding/json"
	"fmt"
	"os"
)

// FileName 文件名称
const FileName = "./data/flow.json"

var flowStatic []types.Flow

var lastId int64

// 初始化数据
func init() {
	fmt.Println("------ Loading flowStatic ------")
	flowStatic = loadFile()
	initLastId()
	fmt.Println("------ Loaded flowStatic ------")
}

// 加载文件
func loadFile() []types.Flow {
	fileBytes, _ := os.ReadFile(FileName)
	var flows []types.Flow
	if len(fileBytes) != 0 {
		if err := json.Unmarshal(fileBytes, &flows); err != nil {
			return nil
		}
	}
	return flows
}

// GetAll 获取全部用户
func GetAll() []types.Flow {
	return flowStatic
}

// Add 添加数据
func Add(user types.Flow) {
	user.Id = getNextId()
	flowStatic = append(flowStatic, user)
	saveFile()
}

// Delete 按照ID删除数据
func Delete(id int64) {
	var index int64
	var flag = false
	if len(flowStatic) > 0 {
		for i, u := range flowStatic {
			if id == u.Id {
				index = int64(i)
				flag = true
			}
		}
	}
	if flag {
		flowStatic = append(flowStatic[:index], flowStatic[index+1:]...)
		saveFile()
	}
}

// FindLists 条件查询：按条件筛选数据，返回符合条件的数据
func FindLists(u types.Flow) []types.Flow {
	uQuery := getQuery(u)

	var results []types.Flow
	if len(flowStatic) > 0 {
		for _, ui := range flowStatic {
			// 字符串模糊
			var flag = true
			if uQuery.ID {
				flag = ui.Id == u.Id
			}
			// TODO 补全其他条件
			//if flag && uQuery.BookName {
			//	flag = strings.Contains(ui.BookName, u.BookName)
			//}
			//if flag && uQuery.UserId {
			//	flag = ui.UserId == u.UserId
			//}
			if flag {
				results = append(results, ui)
			}
		}
	}
	return results
}

// 初始化获取最大的ID
func initLastId() {
	lastId = 0
	if len(flowStatic) > 0 {
		for _, u := range flowStatic {
			if lastId < u.Id {
				lastId = u.Id
			}
		}
	}
}

// 获取下一个ID
func getNextId() int64 {
	return lastId + 1
}

// 保存文件
func saveFile() {
	jsonData, _ := json.Marshal(flowStatic)
	_ = os.WriteFile(FileName, jsonData, os.ModePerm)
}

// 查询条件前置判断，明确哪些条件需要判断
func getQuery(u types.Flow) types.BookQuery {
	var uQuery types.BookQuery
	uQuery.ID = u.Id > 0
	// TODO 补全其他条件
	//uQuery.UserId = u.UserId > 0
	//uQuery.BookName = len(u.BookName) > 0
	return uQuery
}
