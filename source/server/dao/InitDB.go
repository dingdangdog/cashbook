package dao

import (
	"cashbook-server/util"
	"database/sql"
	"fmt"
	_ "modernc.org/sqlite"
	"os"
)

var db *sql.DB

func InitDb(dbpath string, dbname string) {
	util.PathExistsOrCreate(dbpath)
	dblink, err := sql.Open("sqlite", dbpath+"/"+dbname)
	util.CheckErr(err)
	sqlBytes, err := os.ReadFile("./sql/schema.sql")
	util.CheckErr(err)
	schema := string(sqlBytes)
	// 过滤注释内容
	//var re = regexp.MustCompile(`--.*$|/\*[\s\S]*?\*/`)
	//schema = re.ReplaceAllString(schema, "")
	// 执行SQL语句
	_, err = dblink.Exec(schema)
	util.CheckErr(err)
	fmt.Println("--------数据库连接成功！--------")
	db = dblink
	initDist()
}

func initDist() {
	data := GetDistList("expenseType")
	if nil == data || len(data) == 0 {

		fmt.Println("------开始字典数据初始化------")
		sqlBytes, err := os.ReadFile("./sql/dists.sql")
		util.CheckErr(err)
		dist := string(sqlBytes)
		// 过滤注释内容
		//var re = regexp.MustCompile(`--.*$|/\*[\s\S]*?\*/`)
		//dist = re.ReplaceAllString(dist, "")
		// 执行SQL语句
		_, err = db.Exec(dist)
		util.CheckErr(err)
		fmt.Println("------完成字典数据初始化------")
		return
	}

	fmt.Println("------已存在字典数据，无需初始化------")
}
