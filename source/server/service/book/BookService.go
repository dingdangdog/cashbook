package book

import (
	dBook "cashbook-server/dao/book"
	"cashbook-server/types"
	"time"
)

// CreateOrUpdateBook 创建或更新账本
func CreateOrUpdateBook(book types.Book) int64 {
	if book.Id == 0 {
		// 格式化为"年-月-日"的字符串，2006-01-02为特殊规定
		book.CreateDate = time.Now().Format("2006-01-02")
	} else {
		dBook.Delete(book.Id)
	}
	return dBook.AddOrUpdate(book)
}

// GetBookList 根据用户ID获取全部账本
func GetBookList(userId int64) []types.Book {
	book := types.Book{}
	book.UserId = userId
	return dBook.FindLists(book)
}

// DeleteBook 删除账本
func DeleteBook(id int64) {
	dBook.Delete(id)
}
