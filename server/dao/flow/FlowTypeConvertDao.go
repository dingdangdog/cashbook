package flow

import (
	"cashbook-server/config"
	"cashbook-server/util"
	"encoding/json"
	"os"
	"strconv"
)

// TypePath 文件路径
const TypePath = config.DataPath + "types/"

// 加载文件
func loadTypeFile(bookId int64) map[string]string {
	fileBytes := getRelationData(bookId)
	var data map[string]string
	if len(fileBytes) != 0 {
		// 解析 JSON 数据到 map[string]string
		if err := json.Unmarshal(fileBytes, &data); err != nil {
			util.CheckErr(err)
		}
	}
	return data
}

func getRelationData(bookId int64) []byte {
	fileName := TypePath + "flow_type_" + strconv.Itoa(int(bookId)) + ".json"
	fileBytes, err := os.ReadFile(fileName)
	if err != nil && os.IsNotExist(err) {
		// 如果文件不存在，则拷贝另一个指定目录中的文件到指定文件
		srcFile := config.ConfigPath + "flow_type.json" // 默认文件的路径
		if err := util.CopyFile(srcFile, fileName); err != nil {
			panic(err) // 或者执行其他错误处理逻辑
		}
		fileBytes, _ = os.ReadFile(fileName)
	}
	return fileBytes
}

// 保存文件
func saveTypeFile(bookId int64, data map[string]string) {
	fileName := TypePath + "flow_type" + strconv.Itoa(int(bookId)) + ".json"
	jsonData, _ := json.Marshal(data)
	err := os.WriteFile(fileName, jsonData, os.ModePerm)
	util.CheckErr(err)
}

func GetTypeRelation(bookId int64) map[string]string {
	return loadTypeFile(bookId)
}

func UpdateTypeRelation(bookId int64, data map[string]string) {
	saveTypeFile(bookId, data)
}
