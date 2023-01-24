<div align="center">
<span>
<img src="./source/books/src/static/images/cashbook.png" height="60"/>
<h1>cashbook</h1>
</span>
</div>
<p align="center">
DingDangDog’s Cashbook
</p>
<p align="center">
叮噹Dog的记账本
</p>
<p align="center">
  <img alt="stars" src="https://img.shields.io/github/stars/DingDangDog/cashbook" />
  <img alt="dorks" src="https://img.shields.io/github/forks/DingDangDog/cashbook" />
  <img alt="issues-open" src="https://img.shields.io/github/issues/DingDangDog/cashbook?color=important" />
  <img alt="issues-close" src="https://img.shields.io/github/issues-closed/DingDangDog/cashbook?color=green" />
  <img alt="license" src="https://img.shields.io/badge/license-MIT-yellow.svg" />
</p>


## 必读建议

1. 项目提供[演示系统](#演示系统)，不是正式系统，建议不要记录真实数据！原因就不多说了。
2. 建议想要使用此项目的朋友们私有化部署，不要在公网公开使用！保护好隐私！
3. 建议仅作为个人或家庭记账工具使用，商用或其他使用不受约束，出现任何问题概不负责！
4. PS：赚钱的老板不介意的话可以打赏一下哦😁TODO：后续补充打赏方式

## 演示系统

- 请以PC端打开，目前未适配其他终端。
- 演示地址：[cash.oldmoon.top](https://cash.oldmoon.top/)
- 演示账本钥匙：`fScrX9FwtiE`

## 概念说明

- **账本**：本系统的用户级概念，必须打开（登录）账本才能记录、查看流水。
- **钥匙**：每个账本的密码，用于打开账本。
- **流水**：每一笔支出记录即是一个流水。

## 主要功能

- [x] 新增账本
- [x] 记录流水（增删改查）
- [x] 导入导出流水
- [x] 主题切换：黑(`Dark`)/白(`Light`)
- [x] 每日流水趋势曲线
- [x] 流水分类统计饼图
- [x] 初步实现docker部署
- [x] 前后端docker镜像合并部署
- [x] 增加docker-compose容器编排
- [x] 列表展示流水总额

## 私有部署

### Docker

#### 自动部署

> 请先安装`docker`和`docker-compose`再进行以下操作。（如果需要同步安装mongo，请阅读下方**拓展**）

1. 创建本地文件夹
2. 创建`docker-compose.yml`文件，并填入以下内容
    ```yaml
    version: "3"
    
    # 单独编排cashbook容器，mongo需要独立配置URL
    services:
      cashbook:
        image: dingdangdog/cashbook:latest
        restart: always
        environment:
          TZ: "Asia/Shanghai"
          # cashbook使用的mongodb地址，默认是我本地的地址，其他人使用请自行修改
          CASHBOOK_MONGODB_URL: "mongodb://localmongo:localmongo@172.20.96.1:27017/cashbook?authSource=admin"
        ports:
          - 80:80
    ```
3. 在当前文件夹运行命令`docker-compose up -d`，后台运行docker-compose

**拓展：源码根目录有两个编写好的yml文件，可以下载使用**

- docker-compose.yml：单独编排cashbook，需要配置其中的MongoDBurl，即`CASHBOOK_MONGODB_URL`。
- docker-compose+mongo.yml：将cashbook和mongo一起编排，同时安装，若不具备mongo环境，可以使用此文件。注意使用前需要将文件名改为`docker-compose.yml`

#### 手动部署

> 以下操作建议在已经具备有MongoDB环境的情况下进行

1. 拉取docker镜像：

```docker
docker pull dingdangdog/cashbook:latest
```

2. 启动docker容器

```shell
# 注意修改其中的MongoDB地址
docker run -p 16001:80 --name cashbook -e CASHBOOK_MONGODB_URL=mongodb://username:password@127.0.0.1:27017/cashbook?authSource=admin -d dingdangdog/cashbook
```

- `-p 16001:80`：本地端口`16001`映射到容器端口`80`
- `--name cashbook`：容器名`cashbook`
- `-e CASHBOOK_MONGODB_URL=mongodb://username:password@127.0.0.1:27017/cashbook?authSource=admin`：通过环境变量配置MongoDB地址

## 更新日志

- [changelog](./docs/ref/changelog.md)

## 截图展示


### 前置说明

- 部分图片展示的主要内容与老版本没区别，所以可能未更新至最新版本
- 截图仅关注内容即可，主题颜色可忽略

### 打开系统

> 进入系统会自动查询数据，若未打开过账本，会提示`查询失败，请使用合法钥匙`，不必慌张，打开创建好的账本即可，若未创建，创建即可。

![image-20221211184748831](./images/image-20221211185520560.png)

### 新增流水

![image-20221112131654823](./images/image-20221112131654823.png)

![image-20221112131707572](./images/image-20221211184922539.png)

### 日消费统计曲线

![image-20221212164548484](./images/image-20221212164548484.png)

### 消费类型统计饼图

![image-20221212164530378](./images/image-20221212164530378.png)
