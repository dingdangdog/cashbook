package book

import (
	"cashbook-server/types"
	"encoding/json"
	"fmt"
	"os"
)

// FileName 文件名称
const FileName = "./data/dict.json"

var distStatic []types.Dict

var lastId int64

// 初始化数据
func init() {
	fmt.Println("------ Loading distStatic ------")
	distStatic = loadFile()
	initLastId()
	fmt.Println("------ Loaded distStatic ------")
}

// 加载文件
func loadFile() []types.Dict {
	fileBytes, _ := os.ReadFile(FileName)
	var dists []types.Dict
	if len(fileBytes) != 0 {
		if err := json.Unmarshal(fileBytes, &dists); err != nil {
			return nil
		}
	}
	return dists
}

// GetAll 获取全部用户
func GetAll() []types.Dict {
	return distStatic
}

// Add 添加数据
func Add(dict types.Dict) int64 {
	dict.Id = getNextId()
	distStatic = append(distStatic, dict)
	saveFile()
	return dict.Id
}

// Delete 按照ID删除数据
func Delete(id int64) {
	var index int64
	var flag = false
	if len(distStatic) > 0 {
		for i, u := range distStatic {
			if id == u.Id {
				index = int64(i)
				flag = true
			}
		}
	}
	if flag {
		distStatic = append(distStatic[:index], distStatic[index+1:]...)
		saveFile()
	}
}

// FindLists 条件查询：按条件筛选数据，返回符合条件的数据
func FindLists(u types.Dict) []types.Dict {
	uQuery := getQuery(u)

	var results []types.Dict
	if len(distStatic) > 0 {
		for _, ui := range distStatic {
			// 字符串模糊
			var flag = true
			if uQuery.Id {
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
	if len(distStatic) > 0 {
		for _, u := range distStatic {
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
	jsonData, _ := json.Marshal(distStatic)
	_ = os.WriteFile(FileName, jsonData, os.ModePerm)
}

// 查询条件前置判断，明确哪些条件需要判断
func getQuery(u types.Dict) types.DictQuery {
	var uQuery types.DictQuery
	uQuery.Id = u.Id > 0
	// TODO 补全其他条件
	//uQuery.UserId = u.UserId > 0
	//uQuery.BookName = len(u.BookName) > 0
	return uQuery
}
