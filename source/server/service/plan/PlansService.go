package plan

import (
	"cashbook-server/dao"
	"cashbook-server/service/analysis"
	"cashbook-server/types"
	"cashbook-server/util"
	"database/sql"
	_ "modernc.org/sqlite"
	"strconv"
)

func SetPlan(plan types.Plan) {
	sqlCreateFlow := `
		INSERT INTO Plans (month, book_key, limit_money, used_money)
		VALUES (?, ?, ?, ?);
		`
	stmt, err := dao.db.Prepare(sqlCreateFlow)
	util.CheckErr(err)
	_, err = stmt.Exec(plan.Month, plan.BookKey, plan.LimitMoney, plan.UsedMoney)
	util.CheckErr(err)
}

func UpdatePlan(plan types.Plan) {
	sqlUpdatePlan := `
		UPDATE plans SET 
			limit_money = ?
		WHERE month = ? 
		AND book_key = ?;
		`
	stmt, err := dao.db.Prepare(sqlUpdatePlan)
	util.CheckErr(err)
	res, err := stmt.Exec(plan.LimitMoney, plan.Month, plan.BookKey)
	util.CheckErr(err)
	_, err = res.RowsAffected()
	util.CheckErr(err)
}

func GetPlan(bookKey string, month string) types.Plan {
	sqlGetPlan := `
		SELECT month, limit_money, used_money, book_key
		FROM plans 
		WHERE month = ?
		AND book_key = ?;
		`

	rows, err := dao.db.Query(sqlGetPlan, month, bookKey)
	util.CheckErr(err)

	var plan types.Plan
	if rows != nil {
		for rows.Next() {
			err = rows.Scan(&plan.Month, &plan.LimitMoney, &plan.UsedMoney, &plan.BookKey)
			util.CheckErr(err)
			break
		}
		err = rows.Close()
		util.CheckErr(err)
	}

	return plan
}

func GetAllPlan(bookKey string) []types.Plan {
	sqlGetPlan := `
		SELECT month, limit_money, used_money, book_key
		FROM plans 
		WHERE book_key = ?;
		`

	rows, err := dao.db.Query(sqlGetPlan, bookKey)
	util.CheckErr(err)

	results := make([]types.Plan, 0)
	if rows != nil {
		for rows.Next() {
			var plan types.Plan
			err = rows.Scan(&plan.Month, &plan.LimitMoney, &plan.UsedMoney, &plan.BookKey)
			util.CheckErr(err)
			results = append(results, plan)
		}
		err = rows.Close()
		util.CheckErr(err)
	}

	return results
}

func UpdatePlanUsed(bookKey string) {
	used := analysis.MonthBar(bookKey)

	sqlUpdateBatch := ""
	for _, use := range used {
		sqlUpdateBatch += `
		UPDATE plans SET 
			used_money = ` + use.TypeSum + `
		WHERE month = '` + use.Type + `' 
		AND book_key = '` + bookKey + `';
		`
	}

	tx, err := dao.db.Begin()
	util.CheckErr(err)
	res, err := tx.Exec(sqlUpdateBatch)
	util.CheckTxErr(tx, err)
	_, err = res.RowsAffected()
	util.CheckTxErr(tx, err)
	err = tx.Commit()
	util.CheckTxErr(tx, err)
}

func ImportPlansDB(bookKey string, plans []types.Plan, tx *sql.Tx) int64 {
	var num int64
	_, err := tx.Exec(`DELETE FROM plans WHERE book_key = '` + bookKey + `';`)
	num = util.CheckTxErr(tx, err)
	if num == 0 {
		return 0
	}

	sqlInsertPatch := `INSERT INTO plans (book_key, month, limit_money, used_money) VALUES `

	// 组装批量插入sql
	for index, plan := range plans {
		sqlInsertPatch += `('` + bookKey + `','` + plan.Month + `',` +
			strconv.FormatFloat(plan.LimitMoney, 'f', -1, 64) + `,` +
			strconv.FormatFloat(plan.UsedMoney, 'f', -1, 64) + `)`
		if index != (len(plans) - 1) {
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
