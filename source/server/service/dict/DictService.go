package dict

import (
	dDict "cashbook-server/dao/dict"
	"cashbook-server/types"
	"cashbook-server/util"
)

// GetDictList 获取字典列表
func GetDictList(bookId int64, dictType string) []types.Dict {
	return dDict.FindList(types.Dict{BookId: bookId, Type: dictType})
}

// GetDictPage 获取字典分页
func GetDictPage(param types.DictParam) types.Page {
	dictList := dDict.FindList(types.Dict{Id: param.Id, BookId: param.BookId, Type: param.Type, DictKey: param.DictKey, DictValue: param.DictValue})

	objs := make([]interface{}, len(dictList))
	for i, d := range dictList {
		objs[i] = d
	}
	return util.GetPage(param.PageNum, param.PageSize, objs)
}

// AddOrUpdateDict 添加或更新字典
func AddOrUpdateDict(dict types.Dict) int64 {
	if dict.Id != 0 {
		dDict.Delete(dict.Id)
	}
	return dDict.AddOrUpdate(dict)
}

func DeleteDict(id int64) {
	dDict.Delete(id)
}

// CheckAndInitBookDict 检查并初始化账本字典
func CheckAndInitBookDict(bookId int64) {
	dictList := dDict.FindList(types.Dict{BookId: bookId})
	if len(dictList) == 0 {
		defaultDict := dDict.FindList(types.Dict{BookId: -1})
		for _, dict := range defaultDict {
			dict.Id = 0
			dict.BookId = bookId
			dictList = append(dictList, dict)
		}
		dDict.AddByBatch(dictList)
	}
}

// ImportDict 导入字典表
func ImportDict(dictList []types.Dict) int64 {
	dDict.AddByBatch(dictList)
	return int64(len(dictList))
}
