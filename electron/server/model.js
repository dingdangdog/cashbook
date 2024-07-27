
// 提供一些查阅便利的类，js中无需使用，但以后若使用ts改写可能会用
class Flow {
  constructor(id, bookId, day, flowType, type, money, payType, name, description  ) {
    this.id = id;
    this.bookId = bookId;
    this.day = day;
    // 流水类型：支出、收入
    this.flowType = flowType;
    // 消费类型、收入类型
    this.type = type;
    // 支付方式、收款方式
    this.payType = payType;
    this.money = money;
    this.name = name;
    this.description = description;
  }
}

class FlowParam {
  constructor(pageNum, pageSize, id, bookId, startDay, endDay, flowType, type, payType, name, description, moneySort  ) {
    this.pageNum = pageNum;
    this.pageSize = pageSize;
    this.id = id;
    this.bookId = bookId;
    this.startDay = startDay;
    this.endDay = endDay;
    this.flowType = flowType;
    this.type = type;
    this.payType = payType;
    this.name = name;
    this.description = description;
    this.moneySort = moneySort;
  }
}

// 类定义
class Book {
  constructor(id, bookName, userId, createDate) {
    this.id = id;
    this.bookName = bookName;
    this.userId = userId;
    this.createDate = createDate;
  }
}

class User {
  constructor(id, name, userName, password, background, createDate) {
    this.id = id;
    this.name = name;
    this.userName = userName;
    this.password = password;
    this.background = background;
    this.createDate = createDate;
  }
}

class Server {
  constructor(version, environment, serverPath, secret) {
    this.version = version;
    this.environment = environment;
    this.serverPath = serverPath;
    this.secret = secret;
  }
}

class Plan {
  constructor(id, bookId, month, limitMoney, usedMoney) {
    this.id = id;
    this.bookId = bookId;
    this.month = month;
    this.limitMoney = limitMoney;
    this.usedMoney = usedMoney;
  }
}
// 示例的 Typer 类
class Typer {
  constructor(type, value, oldValue, flowType) {
    this.type = type;  // "消费类型" 或 "支付方式"
    this.value = value;
    this.oldValue = oldValue;
    this.flowType = flowType;
    this.lock = false;  // 模拟简单的锁机制
  }

  lockType() {
    this.lock = true;
  }

  unlockType() {
    this.lock = false;
  }
}