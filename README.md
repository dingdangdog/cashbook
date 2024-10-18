<div align="center">
<img src="https://images.oldmoon.top/images/dingdangdog/dingdangdog-1674980314.png" width="80px" alt="cashbook" />
<h1>cashbook</h1>
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
- Gitee：[https://gitee.com/dddogx/cashbook-desktop](https://gitee.com/dddogx/cashbook-desktop)
- 在线体验：[cashbook.oldmoon.top](https://cashbook.oldmoon.top/) (体验账号：cashbook/cashbook `也可注册体验`)
- QQ交流群：564081656

## 简述（Description）

Cashbook记账本。

- 在数据记录上追求简单、易用、自主可控；
- 在统计分析上力求清晰、美观、简洁有效。

**重要提示1：当前版本尚不成熟，后续升级可能有较大变动，请谨慎使用！**
**重要提示2：如果使用docker部署到公网，请自行修改服务密钥和默认密码！！！**

## 开始使用（Get Started）

### Docker部署

推荐使用`docker-compose`，示例如下：

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
# 数据卷/环境变量等请自行修改命令
docker run -d --name cashbook -p 880:80 -v ./data:/app/resources/data dingdangdog/cashbook:latest
```

### 桌面安装

请前往[Releases](https://github.com/dingdangdog/cashbook/releases)页面自行下载安装。

## 主要功能（Features）

- [x] 同一套代码，同样的页面，可以 `Web` 部署，也可以安装桌面程序；
- [x] 支持 `Windows` 安装使用；
- [x] 支持 `Macos` 安装使用(*未测试*)；
- [x] 支持 `Linux` 安装使用(*未测试*)；
- [x] 支持 `Docker` 部署；
- [x] 支持 *支付宝CSV* 个人账单文件导入；
- [x] 支持 *微信CSV* 个人账单文件导入；
- [x] 支持 *京东金融CSV* 个人账单文件导入；
- [x] 数据导入时，[消费类型自动映射转换](#类型映射)；
- [x] 直观的消费日历看板；
- [x] 美观的数据分析图表：支出类型统计饼图、支付方式统计饼图、每日流水统计曲线图、每月流水统计柱状图；
- [x] 支持多用户模式；
- [x] 每个用户可以有多个账本，其账本之间数据独立；
- [x] 无需数据库；
- [x] 数据快速迁移（导入/导出）；
- [ ] 主题系统；
- [ ] 桌面端自动更新；
- [ ] ……

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

没有出现在上述表格中的类型，系统不会处理，将会保留原类型文字进行导入。详细映射关系可查看[type_convert.json](./electron/config/type_convert.json)（`key是原类型，value是目标类型`）。

> PS：如果你还不会账单导出，这里有一个图文教程：[微信/支付宝/京东金融导出账单文件](https://oldmoon.top/post/211)

## 开发技术栈

- Vue3
- Vuetify
- Golang
- Electron
- Javascript
- Docker

## 鸣谢（Acknowledgments）

### 贡献者（Contributor）

- 感谢以下贡献者，排名不分先后

<a href="https://github.com/dingdangdog/cashbook-desktop/graphs/contributors"><img src="https://contrib.rocks/image?repo=dingdangdog/cashbook-desktop" /></a>

### 开发工具（Tools）

- 感谢以下优秀的开发工具

<div style="display:flex; align-item:left">
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/gilbarbara/logos/blob/main/logos/webstorm.svg' width='60px' height='60px'/></a> &nbsp;
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/gilbarbara/logos/blob/main/logos/goland.svg' width='60px' height='60px'/></a> &nbsp;
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/get-icon/geticon/blob/master/icons/intellij-idea.svg' width='60px' height='60px'/></a> &nbsp;
<a href='https://code.visualstudio.com/'><img src='https://github.com/get-icon/geticon/blob/master/icons/visual-studio-code.svg' width='60px' height='60px'/></a>
</div>
