const serverApi = require("./api.js");

const getFileName = () => {
  return `book.csv`;
};

// 类定义
class Book {
  constructor(id, bookName, userId, createDate) {
    this.id = id;
    this.bookName = bookName;
    this.userId = userId;
    this.createDate = createDate;
  }
}

// 读取全部数据
const readBooks = async () => {
  return await serverApi.readData(getFileName());
};

// 增加数据
const addBook = async (book) => {
  const arr = [];
  arr.push(
    new Book(
      serverApi.getUUID(),
      book.userId,
      book.bookName,
      serverApi.getNow()
    )
  );
  await serverApi.addDatas(getFileName(), arr);
  return serverApi.toResult(200, book);
};

// 批量增加数据
const addBooks = async (books) => {
  return await serverApi.addDatas(getFileName(), books);
};

// 删除数据
const deleteBook = async (id) => {
  return await serverApi.deleteDatas(getFileName(), [id]);
};

// 修改数据
const updateBook = async (id, data) => {
  return await serverApi.updateData(getFileName(), id, data);
};

// 基于查询条件的查询
const queryBooks = async (query) => {
  const data = await readBooks();
  let result = data;

  if (query.id) {
    result = result.filter((item) => item.id == query.id);
  }
  if (query.userId) {
    result = result.filter((item) => item.userId == query.userId);
  }
  if (query.bookName) {
    result = result.filter((item) => item.bookName == query.bookName);
  }

  return serverApi.toResult(200, result);
};

const checkBook = async (bookId) => {
  const book = await serverApi.findById(getFileName(), bookId);
  if (book) {
    return serverApi.toResult(200, book);
  }

  return serverApi.toResult(500, "", "无此账本");
};

module.exports = {
  queryBooks,
  addBook,
  deleteBook,
  updateBook,
  checkBook,
};
