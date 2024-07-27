const {
  readData,
  findById,
  addDatas,
  deleteDatas,
  updateData,
} = require("./api.js");
const crypto = require("crypto");

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
  return await readData(getFileName());
};

// 增加数据
const addUser = async (user) => {
  const arr = [];
  arr.push(user);
  return await addDatas(getFileName(), arr);
};

// 批量增加数据
const addUsers = async (users) => {
  return await addDatas(getFileName(), users);
};

// 删除数据
const deleteUser = async (id) => {
  return await deleteDatas(getFileName(), [id]);
};

// 修改数据
const updateUser = async (id, data) => {
  return await updateData(getFileName(), id, data);
};

// 基于查询条件的查询
const queryUsers = async (query) => {
  const data = await readUsers();
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

const register = async (user) => {
  const existingUsers = await queryUsers({ userName: user.userName });
  if (existingUsers.length > 0) {
    return -1;
  }
  await addUser(user);
  return 1;
};

const login = async (userName, password) => {
  const encryptedPassword = encryptBySHA256(userName, password);
  const users = await queryUsers({ userName, password: encryptedPassword });
  if (users.length === 1) {
    return {
      id: users[0].id,
      name: users[0].name,
    };
  }
  return { error: "用户名或密码错误" };
};

const checkPassword = async (id, password) => {
  const user = await findById(id);
  const encryptedPassword = encryptBySHA256(user.userName, password);
  return user.password === encryptedPassword;
};

const changePassword = async (password) => {
  if (!checkPassword(password.id, password.old)) {
    return false;
  }
  const user = await findById(password.id);
  user.password = encryptBySHA256(user.userName, password.new);
  updateUser(password.id, user);
  return true;
};

module.exports = {
  register,
  login,
  changePassword,
  readUsers,
  deleteUser,
};
