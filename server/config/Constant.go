package config

import (
	"fmt"
	"os"
)

const DataPath = "./resources/data/"
const ConfigPath = "./resources/config/"
const ImagePath = "./resources/data/images/"

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
		err = os.MkdirAll(ImagePath, os.ModePerm)
		if err != nil {
			fmt.Println("Error creating folder:", err)
			return
		}
		fmt.Println(ImagePath + " created successfully.")
	} else {
		fmt.Println(DataPath + " already exists.")
		if _, err := os.Stat(ImagePath); os.IsNotExist(err) {
			err := os.MkdirAll(ImagePath, os.ModePerm)
			if err != nil {
				fmt.Println("Error creating folder:", err)
				return
			}
			fmt.Println(ImagePath + " created successfully.")
		} else {
			fmt.Println(ImagePath + " already exists.")
		}
	}

}
