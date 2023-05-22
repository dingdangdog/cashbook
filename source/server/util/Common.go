package util

import (
	"cashbook-server/types"
	"database/sql"
	"fmt"
	"os"
)

func CheckErr(err error) int64 {
	if err != nil {
		fmt.Println("------ Something Error: ", err)
		return 0
	}
	return 1
}

func CheckTxErr(tx *sql.Tx, err error) int64 {
	if err != nil {
		fmt.Println("------ Something Error: ", err)
		err = tx.Rollback()
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

func Error(data any) *types.Result {
	res := new(types.Result)
	res.Code = 500
	res.Message = "ErrExec"
	res.Data = data
	return res
}
