package book

import (
	"cashbook-server/types"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

// FileName 文件名称
const FileName = "./resources/data/dict.json"

var dictStatic []types.Dict

var lastId int64

// 初始化数据
func init() {
	fmt.Println("------ Loading dictStatic ------")
	dictStatic = loadFile()
	initLastId()
	fmt.Println("------ Loaded dictStatic ------")
}

// 加载文件
func loadFile() []types.Dict {
	fileBytes, _ := os.ReadFile(FileName)
	var dictList []types.Dict
	if len(fileBytes) != 0 {
		if err := json.Unmarshal(fileBytes, &dictList); err != nil {
			return nil
		}
	}
	return dictList
}

// GetAll 获取全部字典
func GetAll() []types.Dict {
	return dictStatic
}

// AddOrUpdate 添加数据
func AddOrUpdate(dict types.Dict) int64 {
	if dict.Id == 0 {
		dict.Id = getNextId()
	}
	dictStatic = append(dictStatic, dict)
	saveFile()
	return dict.Id
}

// AddByBatch 批量添加数据
func AddByBatch(dictList []types.Dict) {
	for _, dict := range dictList {
		if dict.Id == 0 {
			dict.Id = getNextId()
		}
		dictStatic = append(dictStatic, dict)
	}
	saveFile()
}

// Delete 按照ID删除数据
func Delete(id int64) {
	var index int64
	var flag = false
	if len(dictStatic) > 0 {
		for i, data := range dictStatic {
			if id == data.Id {
				index = int64(i)
				flag = true
			}
		}
	}
	if flag {
		dictStatic = append(dictStatic[:index], dictStatic[index+1:]...)
		saveFile()
	}
}

// FindList 条件查询：按条件筛选数据，返回符合条件的数据
func FindList(param types.Dict) []types.Dict {
	query := getQuery(param)

	var results []types.Dict
	if len(dictStatic) > 0 {
		for _, data := range dictStatic {
			var flag = true
			if query.Id {
				flag = data.Id == param.Id
			}
			if flag && query.BookId {
				flag = data.BookId == param.BookId
			}
			if flag && query.Type {
				flag = data.Type == param.Type
			}
			if flag && query.DictKey {
				flag = strings.Contains(data.DictKey, param.DictKey)
			}
			if flag && query.DictValue {
				flag = strings.Contains(data.DictValue, param.DictValue)
			}
			if flag {
				results = append(results, data)
			}
		}
	}
	return results
}

// 初始化获取最大的ID
func initLastId() {
	lastId = 0
	if len(dictStatic) > 0 {
		for _, data := range dictStatic {
			if lastId < data.Id {
				lastId = data.Id
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
	jsonData, _ := json.Marshal(dictStatic)
	_ = os.WriteFile(FileName, jsonData, os.ModePerm)
}

// 查询条件前置判断，明确哪些条件需要判断
func getQuery(param types.Dict) types.DictQuery {
	var query types.DictQuery
	query.Id = param.Id > 0
	query.BookId = param.BookId != 0
	query.Type = len(param.Type) > 0
	query.DictKey = len(param.DictKey) > 0
	query.DictValue = len(param.DictValue) > 0
	return query
}
