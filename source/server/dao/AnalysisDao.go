package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
)

func GetDailyLine(flowQuery types.FlowQuery) []types.DailyLine {
	sqlGetFlowPage := `SELECT day, COALESCE(SUM(money),0) AS 'daySum' FROM flows WHERE book_key = '` + flowQuery.BookKey + "'"
	sqlWhere := getWhereSql(flowQuery)
	sqlGroupBy := ` GROUP BY day;`

	sql := sqlGetFlowPage + sqlWhere + sqlGroupBy
	rows, err := db.Query(sql)
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
	sqlGetFlowPage := `SELECT type, COALESCE(SUM(money),0) AS 'typeSum' FROM flows WHERE book_key = '` + flowQuery.BookKey + "'"
	sqlWhere := getWhereSql(flowQuery)
	sqlGroupBy := ` GROUP BY type;`

	sql := sqlGetFlowPage + sqlWhere + sqlGroupBy
	rows, err := db.Query(sql)
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

func GetPayTypeBar(flowQuery types.FlowQuery) []types.TypePie {
	sqlGetFlowPage := `SELECT pay_type, COALESCE(SUM(money),0) AS 'typeSum' FROM flows WHERE book_key = '` + flowQuery.BookKey + "'"
	sqlWhere := getWhereSql(flowQuery)
	sqlGroupBy := ` GROUP BY pay_type;`

	sql := sqlGetFlowPage + sqlWhere + sqlGroupBy
	rows, err := db.Query(sql)
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

func MonthBar(bookKey string) []types.TypePie {
	sqlGetFlowPage := `SELECT SUBSTR(day, 1, 7) AS 'type', COALESCE(SUM(money),0) AS 'typeSum' FROM flows WHERE book_key = '` + bookKey +
		`' GROUP BY SUBSTR(day, 6, 2) ORDER BY SUBSTR(day, 1, 7);`

	sql := sqlGetFlowPage
	rows, err := db.Query(sql)
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
