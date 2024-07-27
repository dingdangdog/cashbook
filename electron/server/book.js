const { readData, addDatas, deleteData, updateData } = require("./api.js");

const getFileName = () => {
  return `book.csv`;
};

// 读取全部数据
const readBooks = async () => {
  return await readData(getFileName());
};

// 增加数据
const addBook = async (book) => {
  const arr = [];
  arr.push(book);
  return await addDatas(getFileName(), arr);
};

// 批量增加数据
const addBooks = async (books) => {
  return await addDatas(getFileName(), books);
};

// 删除数据
const deleteBook = async (id) => {
  return await deleteData(getFileName(), id);
};

// 修改数据
const updateBook = async (id, data) => {
  return await updateData(getFileName(), id, data);
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

  return result;
};

module.exports = {
  queryBooks,
  addBook,
  deleteBook,
  updateBook,
};
