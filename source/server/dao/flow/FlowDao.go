package book

import (
	"cashbook-server/config"
	"cashbook-server/types"
	"cashbook-server/util"
	"encoding/json"
	"os"
	"strconv"
	"strings"
)

// FilePath 文件名称
const FilePath = config.DataPath + "flow"

//const FilePath = "./data/flow"

var flowStatic []types.Flow

var lastId int64

// 加载文件
func loadFile(fileName string) []types.Flow {
	fileBytes, _ := os.ReadFile(FilePath + "/" + fileName)
	var flows []types.Flow
	if len(fileBytes) != 0 {
		if err := json.Unmarshal(fileBytes, &flows); err != nil {
			return nil
		}
	}
	initLastId()
	return flows
}

// GetAll 获取全部用户
func GetAll() []types.Flow {
	return flowStatic
}

// AddOrUpdate 添加或更新数据
func AddOrUpdate(flow types.Flow) int64 {
	getFileData(flow.BookId)
	if flow.Id == 0 {
		flow.Id = getNextId()
	}
	flowStatic = append(flowStatic, flow)
	saveFile(flow.BookId)
	return flow.Id
}

// AddByBatch 批量添加数据
func AddByBatch(flows []types.Flow) int {
	getFileData(flows[0].BookId)
	for _, flow := range flows {
		if flow.Id == 0 {
			flow.Id = getNextId()
		}
		if len(flow.FlowType) == 0 {
			flow.FlowType = "支出"
		}
		flowStatic = append(flowStatic, flow)
	}
	saveFile(flows[0].BookId)
	return len(flows)
}

// Delete 按照ID删除数据
func Delete(id int64, bookId int64) {
	getFileData(bookId)
	var index int64
	var flag = false
	if len(flowStatic) > 0 {
		for i, param := range flowStatic {
			if id == param.Id {
				index = int64(i)
				flag = true
				break
			}
		}
	}
	if flag {
		flowStatic = append(flowStatic[:index], flowStatic[index+1:]...)
		saveFile(bookId)
	}
}

// DeleteBatch 按照bookId删除数据
func DeleteBatch(bookId int64) {
	getFileData(bookId)
	// delete all flowStatic data
	flowStatic = nil
	saveFile(bookId)
}

// FindLists 条件查询：按条件筛选数据，返回符合条件的数据
func FindLists(param types.FlowParam) []types.Flow {
	getFileData(param.BookId)
	query := getQuery(param)

	var results []types.Flow
	if len(flowStatic) > 0 {
		for _, data := range flowStatic {
			// 字符串模糊
			var flag = true
			if query.Id {
				flag = data.Id == param.Id
			}
			if flag && query.BookId {
				flag = data.BookId == param.BookId
			}
			if flag && query.Name {
				flag = strings.Contains(data.Name, param.Name)
			}
			if param.FlowType == "支出" {
				// 兼容历史版本数据，历史版本无FlowType，默认为支出数据
				flag = strings.Contains(data.FlowType, param.FlowType) || len(data.FlowType) == 0
			} else if flag && query.FlowType {
				flag = strings.Contains(data.FlowType, param.FlowType)
			}
			if flag && query.Type {
				flag = strings.Contains(data.Type, param.Type)
			}
			if flag && query.PayType {
				flag = strings.Contains(data.PayType, param.PayType)
			}
			if flag && query.Description {
				flag = strings.Contains(data.Description, param.Description)
			}
			if flag && query.StartDay {
				flag = data.Day >= param.StartDay
			}
			if flag && query.EndDay {
				flag = data.Day <= param.EndDay
			}
			if flag {
				results = append(results, data)
			}
		}
	}

	if query.MoneySort {
		if param.MoneySort == "ASC" {
			for i := 0; i < len(results); i++ {
				for j := 0; j < len(results)-i-1; j++ {
					if results[j].Money > results[j+1].Money {
						results[j], results[j+1] = results[j+1], results[j]
					}
				}
			}
		} else if param.MoneySort == "DESC" {
			for i := 0; i < len(results); i++ {
				for j := 0; j < len(results)-i-1; j++ {
					if results[j].Money < results[j+1].Money {
						results[j], results[j+1] = results[j+1], results[j]
					}
				}
			}
		}
	} else {
		for i := 0; i < len(results); i++ {
			for j := 0; j < len(results)-i-1; j++ {
				if results[j].Day < results[j+1].Day {
					results[j], results[j+1] = results[j+1], results[j]
				}
			}
		}
	}

	return results
}

// 初始化获取最大的ID
func initLastId() {
	lastId = 0
	if len(flowStatic) > 0 {
		for _, param := range flowStatic {
			if lastId < param.Id {
				lastId = param.Id
			}
		}
	}
}

// 获取下一个ID
func getNextId() int64 {
	lastId = lastId + 1
	return lastId
}

// 保存文件
func saveFile(bookId int64) {
	fileName := "flow" + strconv.Itoa(int(bookId)) + ".json"
	jsonData, _ := json.Marshal(flowStatic)
	// check FilePath exists, if not, create it
	util.PathExistsOrCreate(FilePath)

	err := os.WriteFile(FilePath+"/"+fileName, jsonData, os.ModePerm)
	util.CheckErr(err)
}

func getFileData(bookId int64) []types.Flow {
	fileName := "flow" + strconv.Itoa(int(bookId)) + ".json"
	flowStatic = loadFile(fileName)
	return flowStatic
}

// 查询条件前置判断，明确哪些条件需要判断
func getQuery(param types.FlowParam) types.FlowQuery {
	var query types.FlowQuery
	query.Id = param.Id > 0
	query.BookId = param.BookId > 0
	query.Name = len(param.Name) > 0
	query.Type = len(param.Type) > 0
	query.FlowType = len(param.FlowType) > 0
	query.PayType = len(param.PayType) > 0
	query.Description = len(param.Description) > 0
	query.StartDay = len(param.StartDay) > 0
	query.EndDay = len(param.EndDay) > 0
	query.MoneySort = len(param.MoneySort) > 0
	return query
}
