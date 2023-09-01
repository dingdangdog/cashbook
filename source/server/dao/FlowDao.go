package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
	"database/sql"
	_ "modernc.org/sqlite"
	"strconv"
)

func CreateFlow(flow types.Flow) int64 {
	sqlCreateFlow := `
		INSERT INTO flows (book_key, day, type, money, pay_type, name, description)
		VALUES (?, ?, ?, ?, ?, ?, ?);
		`
	stmt, err := db.Prepare(sqlCreateFlow)
	util.CheckErr(err)
	res, err := stmt.Exec(flow.BookKey, flow.Day, flow.Type, flow.Money, flow.PayType, flow.Name, flow.Description)
	util.CheckErr(err)
	id, err := res.LastInsertId()
	util.CheckErr(err)
	//err = stmt.Close()
	//util.CheckErr(err)
	return id
}
func UpdateFlow(flow types.Flow) {
	sqlUpdateFlow := `
		UPDATE flows SET 
			book_key = ?, 
			day = ?, 
			type = ?, 
			money = ?, 
			pay_type = ?, 
			name = ?, 
			description = ?
		WHERE id = ? ;
		`
	stmt, err := db.Prepare(sqlUpdateFlow)
	util.CheckErr(err)
	res, err := stmt.Exec(flow.BookKey, flow.Day, flow.Type, flow.Money, flow.PayType, flow.Name, flow.Description, flow.Id)
	util.CheckErr(err)
	_, err = res.RowsAffected()
	util.CheckErr(err)
	//err = stmt.Close()
	//util.CheckErr(err)
}

func DeleteFlow(id int64) {
	sqlDeleteFlow := `delete from flows where id = ? ;`
	stmt, err := db.Prepare(sqlDeleteFlow)
	util.CheckErr(err)
	res, err := stmt.Exec(id)
	util.CheckErr(err)
	_, err = res.RowsAffected()
	util.CheckErr(err)
	//err = stmt.Close()
	//util.CheckErr(err)
}

func GetCountAndMoney(flowQuery types.FlowQuery) types.FlowCount {
	sqlGetCountAndMoney := `
		SELECT COUNT(*) AS 'totalCount', COALESCE(SUM(money),0) AS 'totalMoney' 
		FROM flows WHERE book_key = '` + flowQuery.BookKey + "'"

	sqlWhere := getWhereSql(flowQuery)

	rows, err := db.Query(sqlGetCountAndMoney + sqlWhere + `;`)
	util.CheckErr(err)
	var flowCount types.FlowCount
	if rows != nil {
		for rows.Next() {
			err = rows.Scan(&flowCount.TotalCount, &flowCount.TotalMoney)
			util.CheckErr(err)
			break
		}
		err = rows.Close()
		util.CheckErr(err)
	}
	return flowCount
}

func GetFlowsPage(flowQuery types.FlowQuery) *types.Page {
	sqlGetFlowPage := "SELECT id, book_key, day, type, money, pay_type, name, description FROM flows WHERE book_key = '" + flowQuery.BookKey + "'"

	sqlWhere := getWhereSql(flowQuery)

	sqlOrderBy := ` ORDER BY day DESC`
	if len(flowQuery.MoneySort) > 0 {
		sqlOrderBy = `ORDER BY money ` + flowQuery.MoneySort
	}

	offset := (flowQuery.PageNum - 1) * flowQuery.PageSize
	sqlPage := ` LIMIT ` + strconv.FormatInt(flowQuery.PageSize, 10) + ` OFFSET ` + strconv.FormatInt(offset, 10) + `;`

	allSQL := sqlGetFlowPage + sqlWhere + sqlOrderBy + sqlPage

	rows, err := db.Query(allSQL)
	util.CheckErr(err)

	results := make([]interface{}, 0)

	var page = new(types.Page)
	var flowCount types.FlowCount
	if rows != nil {
		for rows.Next() {
			var flow types.Flow
			err = rows.Scan(&flow.Id, &flow.BookKey, &flow.Day, &flow.Type, &flow.Money, &flow.PayType, &flow.Name, &flow.Description)
			util.CheckErr(err)
			results = append(results, flow)
		}

		flowCount = GetCountAndMoney(flowQuery)
		err := rows.Close()
		util.CheckErr(err)
	} else {
		flowCount = types.FlowCount{TotalCount: 0, TotalMoney: 0}
	}

	page.PageData = results
	page.PageSize = flowQuery.PageSize
	page.PageNum = flowQuery.PageNum
	page.TotalCount = flowCount.TotalCount
	page.TotalPage = 0 // TODO 留个坑
	page.TotalMoney = flowCount.TotalMoney

	return page
}

func getWhereSql(flowQuery types.FlowQuery) string {
	var allSQL string
	if 0 != flowQuery.Id {
		allSQL += ` AND id = ` + strconv.FormatInt(flowQuery.Id, 10)
	}
	if 0 != len(flowQuery.StartDay) {
		allSQL += ` AND day >= '` + flowQuery.StartDay + `'`
	}
	if 0 != len(flowQuery.EndDay) {
		allSQL += ` AND day <= '` + flowQuery.EndDay + `'`
	}
	if 0 != len(flowQuery.Type) {
		allSQL += ` AND type = '` + flowQuery.Type + `'`
	}
	if 0 != len(flowQuery.PayType) {
		allSQL += ` AND pay_type = '` + flowQuery.PayType + `'`
	}
	if 0 != len(flowQuery.Name) {
		allSQL += ` AND name LIKE '%'||'` + flowQuery.Name + `'||'%'`
	}
	if 0 != len(flowQuery.Description) {
		allSQL += ` AND description LIKE '%'||'` + flowQuery.Description + `'||'%'`
	}
	return allSQL
}

func GetAll(bookKey string) []types.Flow {
	sqlGetAll := `SELECT id, book_key, day, type, money, pay_type, name, description FROM flows WHERE book_key = '` + bookKey + `';`

	rows, err := db.Query(sqlGetAll, bookKey)
	util.CheckErr(err)

	results := make([]types.Flow, 0)
	if rows != nil {
		for rows.Next() {
			var flow types.Flow
			err = rows.Scan(&flow.Id, &flow.BookKey, &flow.Day, &flow.Type, &flow.Money, &flow.PayType, &flow.Name, &flow.Description)
			util.CheckErr(err)
			results = append(results, flow)
		}
		err = rows.Close()
		util.CheckErr(err)
	}

	return results
}

func ImportFlows(bookKey string, flag string, flows []types.Flow) int64 {
	tx, err := db.Begin()
	num := util.CheckErr(err)
	nums := ImportFlowsDB(bookKey, flag, flows, tx)
	if nums == 0 {
		return 0
	}
	err = tx.Commit()
	num = util.CheckTxErr(tx, err)
	if num == 0 {
		return 0
	}
	return nums
}

func ImportFlowsDB(bookKey string, flag string, flows []types.Flow, tx *sql.Tx) int64 {
	var num int64
	if flag == "overwrite" {
		_, err := tx.Exec(`DELETE FROM flows WHERE book_key = '` + bookKey + `';`)
		num = util.CheckTxErr(tx, err)
		if num == 0 {
			return 0
		}
	}

	sqlInsertPatch := `INSERT INTO flows (book_key, day, type, money, pay_type, name, description) VALUES `

	// 组装批量插入sql
	for index, flow := range flows {
		sqlInsertPatch += `('` + bookKey + `','` + flow.Day + `','` + flow.Type + `',` +
			strconv.FormatFloat(flow.Money, 'f', -1, 64) + `,'` +
			flow.PayType + `','` + flow.Name + `','` + flow.Description + `')`
		if index != (len(flows) - 1) {
			sqlInsertPatch += `,`
		} else {
			sqlInsertPatch += `;`
		}
	}
	res, err := tx.Exec(sqlInsertPatch)
	num = util.CheckTxErr(tx, err)
	if num == 0 {
		return 0
	}
	nums, err := res.RowsAffected()
	num = util.CheckTxErr(tx, err)
	if num == 0 {
		return 0
	}
	num = util.CheckTxErr(tx, err)
	if num == 0 {
		return 0
	}
	return nums
}
