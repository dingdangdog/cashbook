package util

import (
	"cashbook-server/types"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
)

func CheckErr(err error) int64 {
	if err != nil {
		fmt.Println("------ Something Error: ", err)
		return 0
	}
	return 1
}

// PathExistsOrCreate 校验文件夹是否存在，不存在则创建
func PathExistsOrCreate(path string) {
	_, err := os.Stat(path)
	if err == nil {
		return
	}
	err = os.Mkdir(path, os.ModePerm)
	CheckErr(err)
}

func Success(data any) *types.Result {
	res := new(types.Result)
	res.Code = 200
	res.Message = "SuExec"
	res.Data = data
	return res
}

func Error(message string, data any) *types.Result {
	res := new(types.Result)
	res.Code = http.StatusInternalServerError
	res.Message = message
	res.Data = data
	return res
}

func ErrorAll(code int64, message string, data any) *types.Result {
	res := new(types.Result)
	res.Code = code
	res.Message = message
	res.Data = data
	return res
}

func GetPage(pageNum int64, pageSize int64, data []interface{}) types.Page {
	startIndex := (pageNum - 1) * pageSize
	endIndex := pageNum * pageSize
	total := int64(len(data))
	if total < startIndex {
		startIndex = total
	}
	if total < endIndex {
		endIndex = total
	}

	var page types.Page
	page.PageSize = pageSize
	page.TotalCount = total
	page.PageData = data[startIndex:endIndex]

	return page
}

func GetBookId(c *gin.Context) int64 {
	bookId := c.Request.Header.Get("bookId")
	bookIdNum, err := strconv.ParseInt(bookId, 10, 64)
	CheckErr(err)
	return bookIdNum
}

func ArrayContains(array []string, newStr string) bool {
	for _, str := range array {
		if str == newStr {
			return true
		}
	}
	return false
}

func IntContains(arr []int64, i int64) bool {
	for _, num := range arr {
		if num == i {
			return true
		}
	}
	return false
}

// CopyFile 函数用于拷贝文件
func CopyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	// 创建目标文件所在的文件夹
	err = os.MkdirAll(filepath.Dir(dst), os.ModePerm)
	if err != nil {
		return err
	}

	destinationFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destinationFile.Close()

	_, err = io.Copy(destinationFile, sourceFile)
	return err
}
