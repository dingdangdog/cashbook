<div align="center">
<img src="https://images.oldmoon.top/images/dingdangdog/dingdangdog-1674980314.png" width="80px" alt="cashbook" />
<h1>Cashbook</h1>
</div>

<p align="center">
  <img alt="release" src="https://img.shields.io/github/v/release/dingdangdog/cashbook" />
  <img alt="stars" src="https://img.shields.io/github/stars/dingdangdog/cashbook" />
  <img alt="dorks" src="https://img.shields.io/github/forks/dingdangdog/cashbook" />
</p>
<p align="center">
  <img alt="issues-open" src="https://img.shields.io/github/issues/dingdangdog/cashbook?color=important" />
  <img alt="issues-close" src="https://img.shields.io/github/issues-closed/dingdangdog/cashbook?color=green" />
  <img alt="license" src="https://img.shields.io/badge/license-MIT-yellow.svg" />
  <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/dingdangdog/cashbook.svg" />
  <img alt="GitHub Releases Download" src="https://img.shields.io/github/downloads/dingdangdog/cashbook/total.svg" />
</p>

- Github：[https://github.com/dingdangdog/cashbook](https://github.com/dingdangdog/cashbook)
- 在线体验：[cashbook.oldmoon.top](https://cashbook.oldmoon.top/) (体验账号: `cashbook`/`cashbook`)
- 在线体验后台：[cashbook.oldmoon.top/admin](https://cashbook.oldmoon.top/admin) (体验账号: `admin`/`admin123456`)
- QQ交流群：`564081656`

## 简述（Description）

Cashbook记账本。

- 在数据记录上追求简单、易用、自主可控；
- 在统计分析上力求清晰、美观、简洁有效。

**重要提示：如果需要部署到公网，请自行修改各类环境变量（如：后台账号密码、数据库密码、服务地址等）！！！**

## 开始使用（Get Started）

### Docker部署

推荐使用`docker-compose`部署，示例如下：

#### Cashbook 和 数据库 一起部署

```yaml
services:
  main:
    container_name: cashbook4
    depends_on: 
      - "db"
    image: dingdangdog/cashbook:4.0.1
    restart: always
    # network_mode: "host"
    volumes:
      - ./data:/app/data # 数据挂载到本地，不建议修改
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@cashbook_db:5432/cashbook?schema=public" # 数据库链接，【请自行修改！与你的数据库一致】
      NUXT_DATA_PATH: "/app/data" # 数据存储未知，现在只有小票图片了，不建议修改
      NUXT_APP_URL: "https://cashbook.oldmoon.top" # 服务根路径，如果有端口号，需要加上端口号
      NUXT_AUTH_ORIGIN: "https://cashbook.oldmoon.top/api/auth" # 登录授权相关接口地址 【请自行修改域名/IP！最后要以 /api/auth 结尾！】
      NUXT_AUTH_SECRET: "auth_secret" # 前台登录加密使用的密钥 【自行修改！】
      NUXT_ADMIN_USERNAME: "admin" # 后台登录用户名
      # 【自行修改】后台登录密码，密码是加密后的，生成密码可前往 https://cashbook.oldmoon.top/admin/GetPassword 或独立部署后访问 `你的url/admin/GetPassword`
      NUXT_ADMIN_PASSWORD: "fb35e9343a1c095ce1c1d1eb6973dc570953159441c3ee315ecfefb6ed05f4cc"
    ports:
      - 9090:9090 # 账本开放端口 【自行修改！】
  db:
    container_name: cashbook_db
    image: postgres
    restart: always
    #network_mode: "host"
    # set shared memory limit when using docker-compose
    shm_size: 128mb
    # or set shared memory limit when deploy via swarm stack
    volumes:
      - ./db:/var/lib/postgresql/data # 数据库容器数据挂载到本地，不建议修改
    environment:
      #POSTGRES_USER: postgres # 数据库用户名，不填默认为postgres
      POSTGRES_PASSWORD: postgres # 数据库密码 【自行修改！】
      POSTGRES_DB: cashbook
    #ports:
    #  - 5432:5432 # 数据库端口，想要远程连接请放开注释，并建议自行修改端口
```

#### 仅部署Cashbook（有已安装的Postgres数据库）

仅部署 `Cashbook` 的难点在于配置数据库连接，建议自行了解 `docker网络` 相关知识！`(后续会出相关视频教学)`

```yaml
services:
  main:
    container_name: cashbook4
    depends_on: 
      - "db"
    image: dingdangdog/cashbook:4.0.1
    restart: always
    network_mode: "host"
    volumes:
      - ./data:/app/data # 数据挂载到本地，不建议修改
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/cashbook?schema=public" # 数据库链接，【账号密码请自行修改，与你的数据库一致！】
      NUXT_DATA_PATH: "/app/data" # 数据存储未知，现在只有小票图片了，不建议修改
      NUXT_APP_URL: "https://cashbook.oldmoon.top" # 服务根路径，如果有端口号，需要加上端口号
      NUXT_AUTH_ORIGIN: "https://cashbook.oldmoon.top/api/auth" # 登录授权相关接口地址 【请自行修改域名/IP！最后要以 /api/auth 结尾！】
      NUXT_AUTH_SECRET: "auth_secret" # 前台登录加密使用的密钥 【自行修改！】
      NUXT_ADMIN_USERNAME: "admin" # 后台登录用户名
      # 【自行修改】后台登录密码，密码是加密后的，生成密码可前往 https://cashbook.oldmoon.top/admin/GetPassword 或独立部署后访问 `你的url/admin/GetPassword`
      NUXT_ADMIN_PASSWORD: "fb35e9343a1c095ce1c1d1eb6973dc570953159441c3ee315ecfefb6ed05f4cc"
```

### 其他

> 如果您不喜欢使用 `docker-compose`，非常抱歉，您自己研究吧 =.= ~

## 主要功能（Features）

- [x] 前台后台分离，独立后台方便对系统进行管理；
- [x] `Docker` 部署；
- [x] 支持 *支付宝CSV* 个人账单文件导入；
- [x] 支持 *微信CSV* 个人账单文件导入；
- [x] 支持 *京东金融CSV* 个人账单文件导入；
- [x] 数据导入时，[消费类型自动映射转换](#类型映射)；
- [x] 直观的消费日历看板；
- [x] 美观的数据分析图表：支出类型统计饼图、支付方式统计饼图、每日流水统计曲线图、每月流水统计柱状图；
- [x] 支持多用户模式；
- [x] 每个用户可以有多个账本，其账本之间数据独立；
- [x] 数据库：Postgre数据库；
- [x] 上传小票图片；
- [x] 数据快速迁移（导入/导出）；
- [ ] 主题系统；
- [ ] ……

### 类型映射

现在系统设置中可以进行交易类型的映射关系维护了，下面列出项目默认的映射关系，用户安装后可自行修改。

默认映射关系如下：

```json
// key 是 支付宝/微信/京东金融 账单中的消费类型
// value 是账单导入系统后数据中保存的类型
{
  "食品酒饮": "餐饮美食",
  "餐饮美食": "餐饮美食",
  "家居家装": "日用百货",
  "日用百货": "日用百货",
  "鞋服箱包": "日用百货",
  "清洁纸品": "日用百货",
  "医疗保健": "医疗健康",
  "医疗健康": "医疗健康",
  "充值缴费": "充值缴费",
  "教育培训": "教育培训",
  "图书文娱": "文化休闲",
  "运动户外": "文化休闲",
  "文体玩具": "文化休闲",
  "文化休闲": "文化休闲",
  "微信红包": "转账红包",
  "微信红包（单发）": "转账红包",
  "微信红包（群红包）": "转账红包",
  "转账红包": "转账红包",
  "转账": "转账红包",
  "二维码收款": "微信交易",
  "微信交易": "微信交易",
  "商户消费": "微信交易",
  "扫二维码付款": "微信交易",
  "小金库": "投资理财",
  "投资理财": "投资理财",
  "收入": "投资理财",
  "转入零钱通-来自零钱": "投资理财",
  "手机通讯": "数码电器",
  "数码电器": "数码电器",
  "电脑办公": "数码电器",
  "服饰内衣": "服饰装扮",
  "服饰装扮": "服饰装扮",
  "钟表眼镜": "服饰装扮",
  "美妆个护": "美容美发",
  "美容美发": "美容美发",
  "汽车用品": "爱车养车",
  "爱车养车": "爱车养车",
  "亲友代付": "亲友代付",
  "亲属卡交易": "亲友代付",
  "亲属卡交易-退款": "退款",
  "美团平台商户-退款": "退款",
  "退款": "退款",
}
```

> **提示**：如果你认为其中的类型映射不合理，可以在系统部署后自行修改，修改方式下面会详细说明。
>
> PS：如果你还不会账单导出，这里有一个图文教程：[微信/支付宝/京东金融导出账单文件](https://oldmoon.top/post/211)

#### 类型映射关系修改

**后台全局修改**

1. 系统部署后，访问 `url/admin` 登录后台，其中 `url` 是你的服务地址；
2. 登录后台后，进入 `类型数据` 菜单，页面数据列表会列出映射关系（默认映射关系的`账本Id` 和 `用户Id` 都是 `0`）；
3. 修改任意映射关系并保存即可。

> 注意：  
> 1. 后台只能新增默认映射关系；  
> 2. 后台可以修改/删除全局所有映射关系；  
> 3. 默认映射关系会在创建账本时自动应用到新帐本，在 **创建账本之后，账本映射关系和默认映射关系就相互独立了，相同的关系想要全局修改，需要分别修改默认关系和每个账本中的关系！！！**

**前台账本配置**

1. 前台修改入口有两个：`系统管理 -> CSV导入映射配置` / `类型管理 -> CSV导入映射配置`；
2. 进入后编辑关系保存即可，编辑的数据只会应用到当前打开的账本！

## 开发

### 开发环境更新表结构

```sh
npx prisma migrate dev --name <migration-name>
```

- `<migration-name>` 是迁移的名称，通常描述你所做的更改，例如 `add-age-to-user` 或 `create-post-table`。
- `npx prisma migrate dev` 会生成 SQL 迁移文件，并自动应用到开发环境的数据库中。

示例：

```sh
npx prisma migrate dev --name add-age-to-user
```

### Docker

```sh
docker build -t dingdangdog/cashbook:4.0.1 .

docker save -o cashbook.4.0.1.tar dingdangdog/cashbook:4.0.1

docker load -i cashbook.4.0.1.tar
```

## Star

[![Star History Chart](https://api.star-history.com/svg?repos=dingdangdog/cashbook&type=Date)](https://star-history.com/#dingdangdog/cashbook&Date)

## 鸣谢（Acknowledgments）

### 贡献者（Contributor）

<a href="https://github.com/dingdangdog/cashbook-desktop/graphs/contributors"><img src="https://contrib.rocks/image?repo=dingdangdog/cashbook-desktop" /></a>

### 开发工具（Tools）

<div style="display:flex; align-item:left">
<!-- <a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/gilbarbara/logos/blob/main/logos/webstorm.svg' width='60px' height='60px'/></a> &nbsp;
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/gilbarbara/logos/blob/main/logos/goland.svg' width='60px' height='60px'/></a> &nbsp;
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/get-icon/geticon/blob/master/icons/intellij-idea.svg' width='60px' height='60px'/></a> &nbsp; -->
<a href='https://code.visualstudio.com/'><img src='https://github.com/get-icon/geticon/blob/master/icons/visual-studio-code.svg' width='60px' height='60px'/></a>
</div>
