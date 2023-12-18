package book

import (
	"cashbook-server/types"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

// FileName 文件名称
const FileName = "./resources/data/book.json"

var bookStatic []types.Book

var lastId int64

// 初始化数据
func init() {
	fmt.Println("------ Loading bookStatic ------")
	bookStatic = loadFile()
	initLastId()
	fmt.Println("------ Loaded bookStatic ------")
}

// 加载文件
func loadFile() []types.Book {
	fileBytes, _ := os.ReadFile(FileName)
	var books []types.Book
	if len(fileBytes) != 0 {
		if err := json.Unmarshal(fileBytes, &books); err != nil {
			return nil
		}
	}
	return books
}

// GetAll 获取全部用户
func GetAll() []types.Book {
	return bookStatic
}

// AddOrUpdate 添加或更新数据
func AddOrUpdate(book types.Book) int64 {
	if book.Id == 0 {
		book.Id = getNextId()
	}
	bookStatic = append(bookStatic, book)
	saveFile()
	return book.Id
}

// Delete 按照ID删除数据
func Delete(id int64) {
	var index int64
	var flag = false
	if len(bookStatic) > 0 {
		for i, u := range bookStatic {
			if id == u.Id {
				index = int64(i)
				flag = true
			}
		}
	}
	if flag {
		bookStatic = append(bookStatic[:index], bookStatic[index+1:]...)
		saveFile()
	}
}

// GetOneById 按照ID查询数据
func GetOneById(id int64) types.Book {
	if len(bookStatic) > 0 {
		for _, u := range bookStatic {
			if id == u.Id {
				return u
			}
		}
	}
	return types.Book{}
}

// FindLists 条件查询：按条件筛选数据，返回符合条件的数据
func FindLists(u types.Book) []types.Book {
	uQuery := getQuery(u)

	var results []types.Book
	if len(bookStatic) > 0 {
		for _, ui := range bookStatic {
			// 字符串模糊
			var flag = true
			if uQuery.ID {
				flag = ui.Id == u.Id
			}
			if flag && uQuery.BookName {
				flag = strings.Contains(ui.BookName, u.BookName)
			}
			if flag && uQuery.UserId {
				flag = ui.UserId == u.UserId
			}
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
	if len(bookStatic) > 0 {
		for _, u := range bookStatic {
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

// 保存文件
func saveFile() {
	jsonData, _ := json.Marshal(bookStatic)
	_ = os.WriteFile(FileName, jsonData, os.ModePerm)
}

// 查询条件前置判断，明确哪些条件需要判断
func getQuery(u types.Book) types.BookQuery {
	var uQuery types.BookQuery
	uQuery.ID = u.Id > 0
	uQuery.UserId = u.UserId > 0
	uQuery.BookName = len(u.BookName) > 0
	return uQuery
}
