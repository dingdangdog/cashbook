package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
	"time"
)

func CreateBook(book types.Book) int64 {
	// 格式化为"年-月-日"的字符串，2006-01-02为特殊规定
	book.CreateDate = time.Now().Format("2006-01-02")

	sqlCreateBook := `
		INSERT INTO books (book_name, book_key, create_date)
		VALUES (?, ?, ?);
		`
	stmt, err := db.Prepare(sqlCreateBook)
	util.CheckErr(err)
	res, err := stmt.Exec(book.BookName, book.BookKey, book.CreateDate)
	util.CheckErr(err)
	id, err := res.LastInsertId()
	util.CheckErr(err)
	//err = stmt.Close()
	//util.CheckErr(err)
	return id
}

func GetBook(bookKey string) *types.Book {
	sqlGetBook := `SELECT id, book_key, book_name, create_date FROM Books WHERE book_key = '` + bookKey + `';`

	rows, err := db.Query(sqlGetBook)
	util.CheckErr(err)

	var book = new(types.Book)
	if rows != nil {
		for rows.Next() {
			err = rows.Scan(&book.Id, &book.BookKey, &book.BookName, &book.CreateDate)
			util.CheckErr(err)
			break
		}
		err = rows.Close()
		util.CheckErr(err)
	}
	return book
}
