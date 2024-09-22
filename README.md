<div align="center">
<img src="https://images.oldmoon.top/images/dingdangdog/dingdangdog-1674980314.png" width="80px" alt="cashbook" />
<h1>cashbook-web</h1>
</div>

<p align="center">
  <img alt="release" src="https://img.shields.io/github/v/release/dingdangdog/cashbook-desktop" />
  <img alt="stars" src="https://img.shields.io/github/stars/dingdangdog/cashbook-desktop" />
  <img alt="dorks" src="https://img.shields.io/github/forks/dingdangdog/cashbook-desktop" />
</p>
<p align="center">
  <img alt="issues-open" src="https://img.shields.io/github/issues/dingdangdog/cashbook-desktop?color=important" />
  <img alt="issues-close" src="https://img.shields.io/github/issues-closed/dingdangdog/cashbook-desktop?color=green" />
  <img alt="license" src="https://img.shields.io/badge/license-MIT-yellow.svg" />
  <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/dingdangdog/cashbook.svg" />
  <img alt="GitHub Releases Download" src="https://img.shields.io/github/downloads/dingdangdog/cashbook-desktop/total.svg" />
</p>

- Github：[https://github.com/dingdangdog/cashbook-web](https://github.com/dingdangdog/cashbook-web)
- Gitee：[https://gitee.com/dddogx/cashbook-desktop](https://gitee.com/dddogx/cashbook-desktop)
- 在线体验：[cashbook.oldmoon.top](https://cashbook.oldmoon.top/) (体验账号：cashbook/cashbook `也可注册体验`)
- QQ交流群：564081656

## 简述（Description）

Web 记账本。

- 在数据记录上追求简单、易用、自主可控；
- 在统计分析上力求清晰、美观、简洁有效。

**重要提示：当前版本尚不成熟，后续升级可能有较大变动，请谨慎使用！**

## 开始使用（Get Started）

推荐使用`docker-compose`：

```yaml
services:
  cashbook:
    image: dingdangdog/cashbook:latest
    container_name: cashbook
    restart: always
    ports:
      - 880:80
    volumes:
      - ./data:/app/resources/data
    # v2.0.1新增环境变量配置
    environment:
      - TOKEN_SALT=spend-money-like-water
      - ENVIRONMENT=PRO
      # 服务密钥，请自行修改
      - SERVER_KEY=08cc0348-061d-4193-af05-b6cc02df28ea
      # 默认密码，请自行修改
      - DEFAULT_PASSWORD=cashbook
```

如果你不喜欢使用 `docker-compose`，也可以执行以下命令一件执行：

```sh
# 数据卷请自行修改
docker run -d --name cashbook -p 880:80 -v ./data:/app/resources/data dingdangdog/cashbook:latest
```

## 重要说明

1. 本仓库从 `2.0.0` 版本开始，将只保留 `Web/docker部署` 版本，因此进行了大量代码结构调整，删除了后续不再需要的代码及文件。
2. 在发布 `2.0.1` 版本时，将删除 `2.0.0` 版本前的全部发布信息。

### 类型映射

现在系统设置中可以进行交易类型的映射关系维护了，下面列出项目默认的映射关系，用户安装后可自行修改。

> 支付宝、微信、京东金融对应的数据导入后，会根据其字段值映射为本软件类型对应的字段值。

| 支出/收入类型 | 支付宝（`交易分类`） | 微信（`交易类型`） | 京东金融（`交易分类`） |
| -------- | ---- | -------- | ---- |
| 数码电器 | 数码电器 |      | 数码电器/手机通讯/电脑办公 |
| 充值缴费 | 充值缴费 |      | 充值缴费 |
| 美容美发 | 美容美发 | | 美妆个护 |
| 转账红包 | 转账红包 | 微信红包/转账                    |          |
| 日用百货 | 日用百货 |      | 清洁纸品/鞋服箱包 |
| 服饰装扮 | 服饰装扮 |      | 服饰内衣/钟表眼镜 |
| 文化休闲 | 文化休闲/运动户外 |      | 图书文娱/文体玩具 |
| 餐饮美食 | 餐饮美食 |      | 食品酒饮 |
| 医疗健康 | 医疗健康 | | 医疗保健 |
| 亲友代付 | 亲友代付 | 亲属卡交易 |          |
| 家居家装 | 家居家装 |      |          |
| 爱车养车 | 爱车养车 |      | 汽车用品 |
| 投资理财 | 收入/投资理财 | 转入零钱通-来自零钱 | 小金库 |
| 教育培训 | 教育培训 | | 教育培训 |
| 退款 | 退款 | 退款 |          |
| 微信交易 |  | 扫二维码付款/二维码收款/商户消费 | |
|  其他    | 其他/商业服务/生活服务/借用借还 |      | 其他网购/其他/网购/收发快递/白条 |

> PS：如果你不会账单导出，这里有一个图文教程：[微信/支付宝/京东金融导出账单文件](https://oldmoon.top/post/211)

## 主要计划（Plan）

> 以下是一些比较重要的功能开发计划，不代表本系统全部功能，欢迎下载试用！  
> 在目前没什么用户的情况下，不出意外的话，每月更新一次。

- [x] Windows桌面应用（目前是简单的Electron套壳，以后可能还会重构）；
- [x] Docker部署，重构后的系统从`v1.1.6`之后开始同步发布Docker；
- [x] 使用JSON格式存储数据，拒绝一切三方数据库；
- [x] 阿里支付宝CSV个人账单文件导入；
- [x] 微信CSV个人账单文件导入；
- [x] 生成分析报表，如月报/年报功能，暂定 `v1.1.8` 支持月报；
- [ ] ~~数据云同步，暂定 `v1.2.0` 重新支持云同步；~~ 本仓库只保留Docker部署版，几乎不再需要云同步
- [ ] ~~浏览器插件？`姑且想想`~~ 不想了
- [ ] ~~小程序版本？`姑且想想`~~ 不想了
- [ ] Android版本？`姑且想想`
- [ ] ~~Mac版本？`纯属想想`~~ 不想了
- [ ] ~~ios版本？`纯属想想`~~ 不想了

## 开发

### 目录

- `docker`: 存放 `docker` 构建/部署 需要使用的一些文件
- `ui`: 前端 `Vue + Element plus` 代码
- `server`: 后端 `golang + gin` 代码

### 开发命令

```sh
# 启动后端
npm run server:dev
# 启动前端
npm run ui:dev
```

## 鸣谢（Acknowledgments）

### 贡献者（Contributor）

- 感谢以下贡献者，排名不分先后

<a href="https://github.com/dingdangdog/cashbook-desktop/graphs/contributors"><img src="https://contrib.rocks/image?repo=dingdangdog/cashbook-desktop" /></a>

### 开发工具（Tools）

- 感谢以下优秀的开发工具

<div style="display:flex; align-item:left">
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/gilbarbara/logos/blob/main/logos/webstorm.svg' width='80px' height='80px'/></a> &nbsp;
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/gilbarbara/logos/blob/main/logos/goland.svg' width='80px' height='80px'/></a> &nbsp;
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/get-icon/geticon/blob/master/icons/intellij-idea.svg' width='80px' height='80px'/></a> &nbsp;
<a href='https://code.visualstudio.com/'><img src='https://github.com/get-icon/geticon/blob/master/icons/visual-studio-code.svg' width='60px' height='80px'/></a>
</div>
