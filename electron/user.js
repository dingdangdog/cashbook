const serverApi = require("./api.js");
const crypto = require("crypto");
const { getServerInfo } = require("./server.js");

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
const updateUser = async (id, data) => {
  return await serverApi.updateData(getFileName(), id, data);
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
  const encryptedPassword = encryptBySHA256(param.userName, param.password);
  const users = await queryUsers({
    userName: param.userName,
    password: encryptedPassword,
  });
  // console.log(users);
  if (users.length === 1) {
    return serverApi.toResult(200, {
      id: users[0].id,
      name: users[0].name,
    });
  }
  return serverApi.toResult(401, "", "用户名或密码错误");
};

const resetPassword = async (userId, data) => {
  const serverInfo = getServerInfo();
  // userName serverKey
  if (data.serverKey == serverInfo.key) {
    const user = await serverApi.findById(getFileName(), userId);
    user.password = encryptBySHA256(user.userName, serverInfo.password);
    updateUser(password.id, user);
    // 修改密码
    return serverApi.toResult(200, user, "重置成功");
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
  updateUser(password.id, user);
  return serverApi.toResult(200, true);
};

const checkUser = async (userId) => {
  const user = await serverApi.findById(getFileName(), userId);
  // console.log(userId, user);
  if (user) {
    return serverApi.toResult(200, user);
  }

  return serverApi.toResult(403, "", "无此用户");
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
