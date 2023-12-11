package dict

import (
	dDict "cashbook-server/dao/dict"
	"cashbook-server/types"
	"cashbook-server/util"
)

// GetDictList 获取字典列表
func GetDictList(bookKey string, dictType string) []types.Dict {
	return dDict.GetAll()
}

// GetDictPage 获取字典分页
func GetDictPage(query types.DictParam) types.Page {
	dicts := dDict.FindLists(types.Dict{})

	objs := make([]interface{}, len(dicts))
	for i, d := range dicts {
		objs[i] = d
	}
	return util.GetPage(query.PageNum, query.PageSize, objs)
}

// AddDict 添加字典
func AddDict(dict types.Dict) int64 {
	return dDict.Add(dict)
}

// UpdateDict 更新字典 TODO
func UpdateDict(dict types.Dict) {

}

func DeleteDict(id int64) {
	dDict.Delete(id)
}

// CheckAndInitBookDict 检查并初始化字典表 TODO
func CheckAndInitBookDict(bookKey string) {

}

// ImportDict 导入字典表 TODO
func ImportDict(bookKey string, dicts []types.Dict) int64 {

	return 0
}
