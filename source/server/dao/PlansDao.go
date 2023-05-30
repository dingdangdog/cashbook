package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
	_ "modernc.org/sqlite"
)

func SetPlan(plan types.Plan) {
	sqlCreateFlow := `
		INSERT INTO Plans (month, book_key, limit_money, used_money)
		VALUES (?, ?, ?, ?);
		`
	stmt, err := db.Prepare(sqlCreateFlow)
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
	stmt, err := db.Prepare(sqlUpdatePlan)
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

	rows, err := db.Query(sqlGetPlan, month, bookKey)
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

func UpdatePlanUsed(bookKey string) {
	used := MonthBar(bookKey)

	sqlUpdateBatch := ""
	for _, use := range used {
		sqlUpdateBatch += `
		UPDATE plans SET 
			used_money = ` + use.TypeSum + `
		WHERE month = '` + use.Type + `' 
		AND book_key = '` + bookKey + `';
		`
	}

	tx, err := db.Begin()
	util.CheckErr(err)
	res, err := tx.Exec(sqlUpdateBatch)
	util.CheckTxErr(tx, err)
	_, err = res.RowsAffected()
	util.CheckTxErr(tx, err)
	err = tx.Commit()
	util.CheckTxErr(tx, err)
}
