package config

import (
	"fmt"
	"os"
)

const DataPath = "./resources/data/"
const ConfigPath = "./resources/config/"

func init() {
	// 检测文件夹是否存在
	if _, err := os.Stat(DataPath); os.IsNotExist(err) {
		// 文件夹不存在，创建它
		err := os.MkdirAll(DataPath, os.ModePerm)
		if err != nil {
			fmt.Println("Error creating folder:", err)
			return
		}
		fmt.Println(DataPath + " created successfully.")
	} else {
		fmt.Println(DataPath + " already exists.")
	}
}
