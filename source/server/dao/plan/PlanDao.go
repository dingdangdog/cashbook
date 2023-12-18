package book

import (
	"cashbook-server/types"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

// FileName 文件名称
// const FileName = "./resources/app/data/plan.json"
const FileName = "./data/plan.json"

var planStatic []types.Plan

var lastId int64

// 初始化数据
func init() {
	fmt.Println("------ Loading planStatic ------")
	planStatic = loadFile()
	initLastId()
	fmt.Println("------ Loaded planStatic ------")
}

// 加载文件
func loadFile() []types.Plan {
	fileBytes, _ := os.ReadFile(FileName)
	var plans []types.Plan
	if len(fileBytes) != 0 {
		if err := json.Unmarshal(fileBytes, &plans); err != nil {
			return nil
		}
	}
	return plans
}

// GetAll 获取全部用户
func GetAll() []types.Plan {
	return planStatic
}

// AddOrUpdate 添加数据
func AddOrUpdate(plan types.Plan) int64 {
	if plan.Id == 0 {
		plan.Id = getNextId()
	}
	planStatic = append(planStatic, plan)
	saveFile()
	return plan.Id
}

// Delete 按照ID删除数据
func Delete(id int64) {
	var index int64
	var flag = false
	if len(planStatic) > 0 {
		for i, data := range planStatic {
			if id == data.Id {
				index = int64(i)
				flag = true
			}
		}
	}
	if flag {
		planStatic = append(planStatic[:index], planStatic[index+1:]...)
		saveFile()
	}
}

// FindLists 条件查询：按条件筛选数据，返回符合条件的数据
func FindLists(param types.Plan) []types.Plan {
	query := getQuery(param)

	var results []types.Plan
	if len(planStatic) > 0 {
		for _, data := range planStatic {
			var flag = true
			if query.ID {
				flag = data.Id == param.Id
			}
			if flag && query.BookId {
				flag = data.BookId == param.BookId
			}
			// 字符串模糊
			if flag && query.Month {
				flag = strings.Contains(data.Month, param.Month)
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
	if len(planStatic) > 0 {
		for _, data := range planStatic {
			if lastId < data.Id {
				lastId = data.Id
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
func saveFile() {
	jsonData, _ := json.Marshal(planStatic)
	_ = os.WriteFile(FileName, jsonData, os.ModePerm)
}

// 查询条件前置判断，明确哪些条件需要判断
func getQuery(param types.Plan) types.PlanQuery {
	var query types.PlanQuery
	query.ID = param.Id > 0
	query.BookId = param.BookId > 0
	query.Month = len(param.Month) > 0
	return query
}
