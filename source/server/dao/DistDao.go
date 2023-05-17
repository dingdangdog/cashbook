package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
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
