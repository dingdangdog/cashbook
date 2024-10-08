const serverApi = require("./api.js");
const crypto = require("crypto");
const { getServer } = require("./server.js");
const { checkBook } = require("./book.js");

class User {
  constructor(id, name, userName, password, createDate) {
    this.id = id;
    this.name = name;
    this.userName = userName;
    this.password = password;
    this.createDate = createDate;
  }
}

const encryptBySHA256 = (userName, password) => {
  const hash = crypto.createHash("sha256");
  hash.update(userName + password);
  return hash.digest("hex");
};

const getFileName = () => {
  return `user.csv`;
};

// 读取全部数据
const readUsers = async () => {
  return await serverApi.readData(getFileName());
};

// 增加数据
const addUser = async (user) => {
  const arr = [];
  arr.push(user);
  return await serverApi.addDatas(getFileName(), arr);
};

// 批量增加数据
const addUsers = async (users) => {
  return await serverApi.addDatas(getFileName(), users);
};

// 删除数据
const deleteUser = async (id) => {
  return await serverApi.deleteDatas(getFileName(), [id]);
};

// 修改数据
const updateUser = async (data) => {
  return await serverApi.updateData(getFileName(), data);
};

// 基于查询条件的查询
const queryUsers = async (query) => {
  const data = await readUsers();
  // console.log(data);
  // console.log(query);
  let result = data;

  if (query.id) {
    result = result.filter((item) => item.id == query.id);
  }
  if (query.name) {
    result = result.filter((item) => item.name == query.name);
  }
  if (query.userName) {
    result = result.filter((item) => item.userName == query.userName);
  }
  if (query.password) {
    result = result.filter((item) => item.password == query.password);
  }

  return result;
};

// 注册用户
const register = async (user) => {
  // console.log(user);
  const existingUsers = await queryUsers({ userName: user.userName });
  if (existingUsers.length > 0) {
    return -1;
  }
  const password = encryptBySHA256(user.userName, user.password);

  const u = new User(
    serverApi.getUUID(),
    user.name,
    user.userName,
    password,
    serverApi.getNow()
  );
  await addUser(u);
  return serverApi.toResult(200, u);
};

// 登录
const login = async (flag, param) => {
  // console.log(flag, param);
  const encryptedPassword = encryptBySHA256(param.username, param.password);
  const users = await queryUsers({
    userName: param.username,
    password: encryptedPassword,
  });
  if (users.length === 1) {
    return serverApi.toResult(200, {
      id: users[0].id,
      name: users[0].name,
    });
  }
  console.log("登陆失败");
  return serverApi.toResult(401, "", "用户名或密码错误");
};

// 重置密码
const resetPassword = async (data) => {
  const server = getServer();
  // userName serverKey
  if (data.serverKey == server.key) {
    const user = await queryUsers({ userName: data.userName });
    if (user.length === 1) {
      user.password = encryptBySHA256(user.userName, server.password);
      updateUser(user);
      // 修改密码
      return serverApi.toResult(200, user, "重置成功");
    } else {
      return serverApi.toResult(500, "", "用户不存在");
    }
  }
  return serverApi.toResult(500, "", "服务密钥错误");
};

// 校验密码是否正确
const checkPassword = async (id, password) => {
  const user = await serverApi.findById(getFileName(), id);
  const encryptedPassword = encryptBySHA256(user.userName, password);
  return serverApi.toResult(200, user.password === encryptedPassword);
};

// 修改密码
const changePassword = async (password) => {
  if (!checkPassword(password.id, password.old)) {
    return false;
  }
  const user = await serverApi.findById(getFileName(), password.id);
  user.password = encryptBySHA256(user.userName, password.new);
  updateUser(user);
  return serverApi.toResult(200, true);
};

const checkUser = async (userId, bookId) => {
  // console.log("userId", userId);
  const user = await serverApi.findById(getFileName(), userId);

  const res = {};
  res.user = user?.name || "none";

  const book = await checkBook(bookId);
  res.book = book?.bookName || "none";

  return serverApi.toResult(200, res);
};

module.exports = {
  register,
  login,
  changePassword,
  readUsers,
  deleteUser,
  checkUser,
  resetPassword,
};
