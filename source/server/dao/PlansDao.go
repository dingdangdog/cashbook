package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
	_ "modernc.org/sqlite"
)

func SetPlan(plan types.Plan) {
	sqlCreateFlow := `
		INSERT INTO Plans (month, limit_money, used_money)
		VALUES (?, ?, ?);
		`
	stmt, err := db.Prepare(sqlCreateFlow)
	util.CheckErr(err)
	_, err = stmt.Exec(plan.Month, plan.LimitMoney, plan.UsedMoney)
	util.CheckErr(err)
}

func UpdatePlan(plan types.Plan) {
	sqlUpdatePlan := `
		UPDATE plans SET 
			limit_money = ?
		WHERE month = ? ;
		`
	stmt, err := db.Prepare(sqlUpdatePlan)
	util.CheckErr(err)
	res, err := stmt.Exec(plan.LimitMoney, plan.Month)
	util.CheckErr(err)
	_, err = res.RowsAffected()
	util.CheckErr(err)
}

func GetPlan(month string) types.Plan {
	sqlGetPlan := `
		SELECT month, limit_money, used_money 
		FROM plans 
		WHERE month = ?;
		`

	rows, err := db.Query(sqlGetPlan, month)
	util.CheckErr(err)

	var plan types.Plan
	if rows != nil {
		for rows.Next() {
			err = rows.Scan(&plan.Month, &plan.LimitMoney, &plan.UsedMoney)
			util.CheckErr(err)
			break
		}
		err = rows.Close()
		util.CheckErr(err)
	}

	return plan
}
