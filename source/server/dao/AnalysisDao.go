package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
)

func GetDailyLine(flowQuery types.FlowQuery) []types.DailyLine {
	sqlGetFlowPage := `SELECT day, SUM(money) AS 'daySum' FROM flows WHERE book_key = ?`
	sqlWhere := getWhereSql(flowQuery)
	sqlGroupBy := ` GROUP BY day;`

	sql := sqlGetFlowPage + sqlWhere + sqlGroupBy
	rows, err := db.Query(sql, flowQuery.BookKey)
	util.CheckErr(err)

	results := make([]types.DailyLine, 0)
	if rows != nil {
		for rows.Next() {
			var daily types.DailyLine
			err = rows.Scan(&daily.Day, &daily.DaySum)
			util.CheckErr(err)
			results = append(results, daily)
		}
		err := rows.Close()
		util.CheckErr(err)
	}

	return results
}

func GetTypePie(flowQuery types.FlowQuery) []types.TypePie {
	sqlGetFlowPage := `SELECT type, SUM(money) AS 'typeSum' FROM flows WHERE book_key = ?`
	sqlWhere := getWhereSql(flowQuery)
	sqlGroupBy := ` GROUP BY type;`

	sql := sqlGetFlowPage + sqlWhere + sqlGroupBy
	rows, err := db.Query(sql, flowQuery.BookKey)
	util.CheckErr(err)

	results := make([]types.TypePie, 0)
	if rows != nil {
		for rows.Next() {
			var typePie types.TypePie
			err = rows.Scan(&typePie.Type, &typePie.TypeSum)
			util.CheckErr(err)
			results = append(results, typePie)
		}
		err := rows.Close()
		util.CheckErr(err)
	}

	return results
}
