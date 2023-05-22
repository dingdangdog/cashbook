package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
	"strconv"
)

func GetDistList(Type string) []types.Dist {
	sqlGetDistList := `SELECT id, dist_key, dist_value, type, sort FROM dists WHERE type = ? ORDER BY sort;`

	rows, err := db.Query(sqlGetDistList, Type)
	util.CheckErr(err)

	results := make([]types.Dist, 0)
	if rows != nil {
		for rows.Next() {
			var dist types.Dist
			err = rows.Scan(&dist.Id, &dist.DistKey, &dist.DistValue, &dist.Type, &dist.Sort)
			util.CheckErr(err)
			results = append(results, dist)
		}
		err := rows.Close()
		util.CheckErr(err)
	}

	return results
}

func GetDistPage(query types.DistQuery) *types.Page {
	sqlGetDistPage := "SELECT id, type, dist_key, dist_value, sort FROM dists WHERE 1=1"

	sqlWhere := getDistWhereSql(query)

	sqlOrderBy := ` ORDER BY type, sort`

	offset := (query.PageNum - 1) * query.PageSize
	sqlPage := ` LIMIT ` + strconv.FormatInt(query.PageSize, 10) + ` OFFSET ` + strconv.FormatInt(offset, 10) + `;`

	sql := sqlGetDistPage + sqlWhere + sqlOrderBy + sqlPage

	rows, err := db.Query(sql)
	util.CheckErr(err)

	results := make([]interface{}, 0)

	var page = new(types.Page)
	var distCount int64
	if rows != nil {
		for rows.Next() {
			var dist types.Dist
			err = rows.Scan(&dist.Id, &dist.Type, &dist.DistKey, &dist.DistValue, &dist.Sort)
			util.CheckErr(err)
			results = append(results, dist)
		}

		distCount = getDistCount(query)
		err := rows.Close()
		util.CheckErr(err)
	} else {
		distCount = 0
	}

	page.PageData = results
	page.PageSize = query.PageSize
	page.PageNum = query.PageNum
	page.TotalCount = distCount

	return page

}

func getDistCount(query types.DistQuery) int64 {
	sqlGetDistCount := `
		SELECT COUNT(*) AS 'count'
		FROM dists WHERE 1=1`

	sqlWhere := getDistWhereSql(query)

	rows, err := db.Query(sqlGetDistCount + sqlWhere + `;`)
	util.CheckErr(err)
	var count int64
	if rows != nil {
		for rows.Next() {
			err = rows.Scan(&count)
			util.CheckErr(err)
			break
		}
		err = rows.Close()
		util.CheckErr(err)
	}
	return count
}

func getDistWhereSql(query types.DistQuery) string {
	var sql string
	if 0 != query.Id {
		sql += ` AND id = ` + strconv.FormatInt(query.Id, 10)
	}
	if 0 != len(query.Type) {
		sql += ` AND type = '` + query.Type + `'`
	}
	if 0 != len(query.DistKey) {
		sql += ` AND dist_key ='` + query.DistKey + `'`
	}
	if 0 != len(query.DistValue) {
		sql += ` AND dist_value like '%'||'` + query.DistValue + `'||'%'`
	}

	return sql
}

func AddDist(dist types.Dist) int64 {
	sqlAddDist := `
		INSERT INTO dists (type, dist_key, dist_value, sort)
		VALUES (?, ?, ?, ?);
		`
	stmt, err := db.Prepare(sqlAddDist)
	util.CheckErr(err)
	res, err := stmt.Exec(dist.Type, dist.DistKey, dist.DistValue, dist.Sort)
	util.CheckErr(err)
	id, err := res.LastInsertId()
	util.CheckErr(err)
	return id
}
func UpdateDist(dist types.Dist) {
	sqlUpdateDist := `
		UPDATE dists SET 
			type = ?, 
			dist_key = ?, 
			dist_value = ?, 
			sort = ?
		WHERE id = ? ;
		`
	stmt, err := db.Prepare(sqlUpdateDist)
	util.CheckErr(err)
	res, err := stmt.Exec(dist.Type, dist.DistKey, dist.DistValue, dist.Sort, dist.Id)
	util.CheckErr(err)
	_, err = res.RowsAffected()
	util.CheckErr(err)
}

func DeleteDist(id int64) {
	sqlDeleteFlow := `delete from dists where id = ? ;`
	stmt, err := db.Prepare(sqlDeleteFlow)
	util.CheckErr(err)
	res, err := stmt.Exec(id)
	util.CheckErr(err)
	_, err = res.RowsAffected()
	util.CheckErr(err)
}
