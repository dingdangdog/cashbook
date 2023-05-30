package dao

import (
	"cashbook-server/types"
	"cashbook-server/util"
	"database/sql"
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

func GetBook(bookKey string) types.Book {
	sqlGetBook := `SELECT id, book_key, book_name, create_date FROM Books WHERE book_key = '` + bookKey + `';`

	rows, err := db.Query(sqlGetBook)
	util.CheckErr(err)

	var book types.Book
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

func ChangeKey(change types.ChangeBookKey) int64 {
	book := GetBook(change.BookKey)
	if book.Id != 0 {
		return 0
	}

	tx, err := db.Begin()
	id := util.CheckErr(err)
	if id == 0 {
		return 0
	}

	// 更新账本
	sqlUpdateBook := `
		UPDATE books SET book_key = ? WHERE book_key = ? ;
		`
	id = exec(sqlUpdateBook, tx, change.BookKey, change.OldKey)
	if id == 0 {
		return 0
	}

	// 更新流水
	sqlUpdateFlows := `
		UPDATE flows SET book_key = ? WHERE book_key = ? ;
		`
	id = exec(sqlUpdateFlows, tx, change.BookKey, change.OldKey)
	if id == 0 {
		return 0
	}

	// 更新字典
	sqlUpdateDists := `
		UPDATE dists SET book_key = ? WHERE book_key = ? ;
		`
	id = exec(sqlUpdateDists, tx, change.BookKey, change.OldKey)
	if id == 0 {
		return 0
	}

	// 更新额度设置
	sqlUpdatePlans := `
		UPDATE plans SET book_key = ? WHERE book_key = ? ;
		`
	id = exec(sqlUpdatePlans, tx, change.BookKey, change.OldKey)
	if id == 0 {
		return 0
	}

	//提交事务
	err = tx.Commit()
	id = util.CheckTxErr(tx, err)
	if id == 0 {
		return 0
	}

	book = GetBook(change.BookKey)
	return book.Id
}

func exec(sql string, tx *sql.Tx, bookKey string, oldKey string) int64 {
	stmt, err := tx.Prepare(sql)
	id := util.CheckTxErr(tx, err)
	if id == 0 {
		return 0
	}
	res, err := stmt.Exec(bookKey, oldKey)
	id = util.CheckTxErr(tx, err)
	if id == 0 {
		return 0
	}
	_, err = res.RowsAffected()
	id = util.CheckTxErr(tx, err)
	if id == 0 {
		return 0
	}

	return 1
}
