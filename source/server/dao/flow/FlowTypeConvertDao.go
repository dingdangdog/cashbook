package flow

import (
	"cashbook-server/config"
	"cashbook-server/util"
	"encoding/json"
	"fmt"
	"os"
)

// TypeFile 文件路径
const TypeFile = config.DataPath + "flow_type.json"

//const FilePath = "./resources/app/config/"

var typesRelation map[string]string

// 初始化数据
func init() {
	fmt.Println("------ Loading TypeRelation ------")
	typesRelation = loadTypeFile()
	fmt.Println("------ Loaded TypeRelation ------")
}

// 加载文件
func loadTypeFile() map[string]string {
	fileBytes := getRelationData()
	var data map[string]string
	if len(fileBytes) != 0 {
		// 解析 JSON 数据到 map[string]string
		if err := json.Unmarshal(fileBytes, &data); err != nil {
			util.CheckErr(err)
		}
	}
	initLastId()
	return data
}

func getRelationData() []byte {
	fileBytes, err := os.ReadFile(TypeFile)
	if err != nil && os.IsNotExist(err) {
		// 如果文件不存在，则拷贝另一个指定目录中的文件到指定文件
		srcFile := "./default/flow_type.json" // 默认文件的路径
		if err := util.CopyFile(srcFile, TypeFile); err != nil {
			panic(err) // 或者执行其他错误处理逻辑
		}
		fileBytes, err = os.ReadFile(TypeFile)
	}
	return fileBytes
}

// 保存文件
func saveTypeFile() {
	jsonData, _ := json.Marshal(typesRelation)
	err := os.WriteFile(TypeFile, jsonData, os.ModePerm)
	util.CheckErr(err)
}

func getTypeFileData() map[string]string {
	typesRelation = loadTypeFile()
	return typesRelation
}

func GetTypeRelation() map[string]string {
	return getTypeFileData()
}

func UpdateTypeRelation(data map[string]string) {
	typesRelation = data
	saveTypeFile()
}
