package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
	"database/sql"
	"encoding/json"
	"fmt"
	_ "modernc.org/sqlite"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var db *sql.DB
var exePath string

func InitDb() {
	exePath, _ = os.Executable()
	if strings.Contains(filepath.Base(exePath), "go_build_main_go.exe") {
		// Windows开发环境下
		dir, err := os.Getwd()
		util.CheckErr(err)
		exePath = dir
	} else {
		exePath = filepath.Dir(exePath)
	}

	util.PathExistsOrCreate(exePath + "/data")
	db, _ = sql.Open("sqlite", exePath+"/data/cashbook.db")
	//util.CheckErr(err)
	sqlBytes, err := os.ReadFile(exePath + "/sql/schema.sql")
	util.CheckErr(err)
	schema := string(sqlBytes)
	// 过滤注释内容
	//var re = regexp.MustCompile(`--.*$|/\*[\s\S]*?\*/`)
	//schema = re.ReplaceAllString(schema, "")
	// 执行SQL语句
	_, err = db.Exec(schema)
	util.CheckErr(err)
	fmt.Println("-------- 数据库连接成功 --------")

	alterTableSchema()

	initDist()
	initServerInfo()
}

func initDist() {
	data := GetDistList("", "expenseType")
	if nil == data || len(data) == 0 {

		fmt.Println("------ 开始字典数据初始化 ------")
		sqlBytes, err := os.ReadFile(exePath + "/sql/dists.sql")
		util.CheckErr(err)
		dist := string(sqlBytes)
		// 过滤注释内容
		//var re = regexp.MustCompile(`--.*$|/\*[\s\S]*?\*/`)
		//dist = re.ReplaceAllString(dist, "")
		// 执行SQL语句
		_, err = db.Exec(dist)
		util.CheckErr(err)
		fmt.Println("------ 完成字典数据初始化 ------")
		return
	}

	fmt.Println("------ 已存在字典数据，无需初始化 ------")
}

// initServerInfo 初始化服务信息
func initServerInfo() {
	confBytes, err := os.ReadFile(exePath + "/config/server.conf")
	util.CheckErr(err)
	var conf types.Server
	if len(confBytes) != 0 {
		if err := json.Unmarshal(confBytes, &conf); err != nil {
			util.CheckErr(err)
			return
		}
	}
	server := GetServerInfo()

	if 0 == server.Id {
		// 第一次，创建
		conf.CreateDate = time.Now().Format("2006-01-02")
		stmt, err := db.Prepare(`INSERT INTO server (id, version, environment, create_date) VALUES (1, ?, ?, ?)`)
		util.CheckErr(err)
		res, err := stmt.Exec(conf.Version, conf.Environment, conf.CreateDate)
		util.CheckErr(err)
		_, err = res.LastInsertId()
		util.CheckErr(err)
	} else {
		// 非第一次，更新
		stmt, err := db.Prepare(`UPDATE server SET version = ?, environment = ? WHERE id = 1`)
		util.CheckErr(err)
		res, err := stmt.Exec(conf.Version, conf.Environment)
		util.CheckErr(err)
		_, err = res.RowsAffected()
		util.CheckErr(err)
	}
}

func alterTableSchema() {
	// 增加 字典的 book_key 字段
	sqlDistAddBookKey := `
		ALTER TABLE dists ADD COLUMN book_key TEXT;
		`
	_, err := db.Exec(sqlDistAddBookKey)
	util.CheckErr(err)
}
