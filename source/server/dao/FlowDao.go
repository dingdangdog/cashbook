package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
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
	err = stmt.Close()
	util.CheckErr(err)
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
}

func DeleteFlow(id int64) {
	sqlDeleteFlow := `delete from flows where id = ? ;`
	stmt, err := db.Prepare(sqlDeleteFlow)
	util.CheckErr(err)
	res, err := stmt.Exec(id)
	util.CheckErr(err)
	_, err = res.RowsAffected()
	util.CheckErr(err)
}

func GetCountAndMoney(flowQuery types.FlowQuery) types.FlowCount {
	sqlGetCountAndMoney := `
		SELECT COUNT(*) AS 'totalCount', SUM(money) AS 'totalMoney' 
		FROM flows WHERE book_key = ` + flowQuery.BookKey
	sqlWhere := getWhereSql(flowQuery)

	rows, err := db.Query(sqlGetCountAndMoney + sqlWhere + `;`)
	util.CheckErr(err)
	var flowCount types.FlowCount
	for rows.Next() {
		err = rows.Scan(&flowCount.TotalCount, &flowCount.TotalMoney)
		util.CheckErr(err)
		break
	}
	return flowCount
}

func GetFlowsPage(flowQuery types.FlowQuery) *types.Page {
	sqlGetFlowPage := `SELECT id, book_key, 'day', 'type', money, pay_type, 'name', description FROM flows WHERE book_key = ?`
	sqlWhere := getWhereSql(flowQuery)

	offset := (flowQuery.PageNum - 1) * flowQuery.PageSize
	sqlOrderBy := ` ORDER BY day DESC;`
	sqlPage := ` LIMIT ` + strconv.FormatInt(flowQuery.PageSize, 10) + ` OFFSET ` + strconv.FormatInt(offset, 10)
	sql := sqlGetFlowPage + sqlWhere + sqlOrderBy + sqlPage

	rows, err := db.Query(sql, flowQuery.BookKey)
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
	var sql string
	if 0 != flowQuery.Id {
		sql += ` AND id = ` + strconv.FormatInt(flowQuery.Id, 10)
	}
	if 0 != len(flowQuery.StartDay) {
		sql += ` AND day >= ` + flowQuery.StartDay
	}
	if 0 != len(flowQuery.EndDay) {
		sql += ` AND day < ` + flowQuery.EndDay
	}
	if 0 != len(flowQuery.Type) {
		sql += ` AND type = ` + flowQuery.Type
	}
	if 0 != len(flowQuery.PayType) {
		sql += ` AND pay_type = ` + flowQuery.PayType
	}
	if 0 != len(flowQuery.Name) {
		sql += ` AND name LIKE '%'||` + flowQuery.Name + `||'%'`
	}
	if 0 != len(flowQuery.Description) {
		sql += ` AND description LIKE '%'||` + flowQuery.Description + `||'%'`
	}
	return sql
}

func GetAll(bookKey string) []types.Flow {
	sqlGetAll := `SELECT id, book_key, 'day', 'type', money, pay_type, 'name', description FROM flows WHERE book_key = ?;`

	rows, err := db.Query(sqlGetAll, bookKey)
	util.CheckErr(err)

	results := make([]types.Flow, 0)
	for rows.Next() {
		var flow types.Flow
		err = rows.Scan(&flow.Id, &flow.BookKey, &flow.Day, &flow.Type, &flow.Money, &flow.PayType, &flow.Name, &flow.Description)
		util.CheckErr(err)
		results = append(results, flow)
	}

	return results
}
