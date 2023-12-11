package book

import (
	dBook "cashbook-server/dao/book"
	"cashbook-server/types"
	"time"
)

// CreateBook 创建账本
func CreateBook(book types.Book) int64 {
	// 格式化为"年-月-日"的字符串，2006-01-02为特殊规定
	book.CreateDate = time.Now().Format("2006-01-02")

	id := dBook.Add(book)
	return id
}

// GetBook 根据账本ID获取账本 TODO
func GetBook(bookKey string) types.Book {
	return dBook.GetOneById(1)
}

// ChangeKey 修改密钥 TODO
func ChangeKey(change types.ChangeBookKey) int64 {
	book := GetBook(change.BookKey)
	if book.Id != 0 {
		return 0
	}

	return book.Id
}

// GetAllBook 根据用户ID获取全部账本 TODO
func GetAllBook() []types.Book {
	return dBook.GetAll()
}
