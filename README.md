<div align="center">
<img src="https://images.oldmoon.top/images/dingdangdog/dingdangdog1674980314.png" width="80px" alt="cashbook" />
<h1>cashbook-desktop</h1>
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
</p>

- cashbook's desktop application
- 桌面版账本，目前仅支持`Windows`桌面版。
- 在线体验：[cashbook.oldmoon.top](https://cashbook.oldmoon.top/) (体验账号：cashbook/cashbook)

## 简述（Description）

本项目的目标是一个终端独立安装的记账本软件。

- 在数据记录上追求简单、易用、自主可控；
- 在统计分析上力求清晰、美观、简洁有效。

> 重要提示：当前版本尚不成熟，后续升级可能有较大变动，请谨慎使用！

## 开始使用（Get Started）

### 1. windows下载安装

前往【[Releases](https://github.com/dingdangdog/cashbook-desktop/releases/)】页面自行下载安装。

### 2. docker部署

推荐使用`docker-compose`：

```yaml
version: "3"

services:
  cashbook:
    image: dingdangdog/cashbook:latest
    restart: always
    ports:
      - 880:80
    volumes:
      - ./data:/app/resources/app/data
```

## 主要计划（Plan）

> 以下是一些比较重要的功能开发计划，不代表本系统全部功能，欢迎下载试用！  
> 在目前没什么用户的情况下，不出意外的话，每月更新一次。

- [x] 使用JSON格式存储数据，拒绝一切三方数据库；
- [x] 阿里支付宝CSV个人账单文件导入；
- [x] 微信CSV个人账单文件导入；
- [x] ~~构建Docker部署镜像；~~ 替换为云部署版本
- [ ] 数据云同步；
- [ ] 生成分析报表/年报功能；
- [x] 云部署版本：`v1.1.6`开始同步发布docker镜像
- [ ] 浏览器插件？`姑且想想`
- [ ] 小程序版本？`姑且想想`
- [ ] Android版本？`姑且想想`
- [ ] Mac版本？`纯属想想`
- [ ] iphone版本？`纯属想想`

## 重要说明

1.1.0-BETA版本前后有非常大的差异，页面到后端整体全部重构了一次，推荐使用最新版！

- 1.1.0-BETA版本前的一些说明：[NOTICE](./doc/NOTICE.md)

### 类型映射

| 本软件类型 | 支付宝 | 微信 | 京东金融 | 备注 |
| -------- | ---- | -------- | ---- | ---- |
| 数码电器 | 数码电器 |      | 数码电器/手机通讯/电脑办公 | 电子产品、家电等 |
| 充值缴费 | 充值缴费 |      | 充值缴费 | 水电、话费等 |
| 美容美发 | 美容美发 | | 美妆个护 | 理发、护肤等 |
| 转账红包 | 转账红包 | 微信红包/转账                    |          | 转账、红包等 |
| 日用百货 | 日用百货 |      | 清洁纸品/鞋服箱包 | 垃圾袋、卫生纸等 |
| 服饰装扮 | 服饰装扮 |      | 服饰内衣/钟表眼镜 | 鞋服等 |
| 文化休闲 | 文化休闲/运动户外 |      | 图书文娱/文体玩具 | 书籍、游戏、视频软件VIP等 |
| 餐饮美食 | 餐饮美食 |      | 食品酒饮 | 吃好喝好 |
| 医疗健康 | 医疗健康 | | 医疗保健 | 药品、保养品等 |
| 亲友代付 | 亲友代付 | 亲属卡交易 |          | 如题 |
| 家居家装 | 家居家装 |      |          | 家具、装修用品等 |
| 爱车养车 | 爱车养车 |      | 汽车用品 | 保养、油气、过路费等 |
| 投资理财 | 收入/投资理财 | 转入零钱通-来自零钱 | 小金库 | 理财收益、签到红包等 |
| 教育培训 | 教育培训 | | 教育培训 | 网课、培训等 |
| 退款 | 退款 | 退款 |          |  |
| 微信交易 |  | 扫二维码付款/二维码收款/商户消费 | | 这部分交易需要人工分类 |
|  其他    | 其他/商业服务/生活服务/借用借还 |      | 其他网购/其他/网购/收发快递/白条 | 一些少见或未知类型，通常需要人工分类 |


## 截图展示

- 1.1.0-BETA版本前：[DISPLAY](./doc/DISPLAY.md)
- 1.1.0-BETA版本：https://github.com/dingdangdog/cashbook-desktop/blob/main/images/new/1.1.0-BETA.mp4

## 贡献者（Contributor）

### 感谢以下大佬的代码

<a href="https://github.com/dingdangdog/cashbook-desktop/graphs/contributors"><img src="https://contrib.rocks/image?repo=dingdangdog/cashbook-desktop" /></a>

### 感谢以下优秀的开发工具
<div style="display:flex; align-item:left">
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/gilbarbara/logos/blob/main/logos/webstorm.svg' width='80px' height='80px'/></a> &nbsp;
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/gilbarbara/logos/blob/main/logos/goland.svg' width='80px' height='80px'/></a> &nbsp;
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/get-icon/geticon/blob/master/icons/intellij-idea.svg' width='80px' height='80px'/></a> &nbsp;
<a href='https://code.visualstudio.com/'><img src='https://github.com/get-icon/geticon/blob/master/icons/visual-studio-code.svg' width='60px' height='80px'/></a>
</div>
