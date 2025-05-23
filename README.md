<div align="center" style="display:flex;align-items:center;justify-content:center;">
<img src="/public/logo.png" width="80px" alt="cashbook" />
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
<!--   <img alt="GitHub Releases Download" src="https://img.shields.io/github/downloads/dingdangdog/cashbook/total.svg" /> -->
</p>

- 官方文档站：[https://doc.cashbook.oldmoon.top](https://doc.cashbook.oldmoon.top)
- 在线体验：[cashbook.oldmoon.top](https://cashbook.oldmoon.top/) (体验账号: `cashbook`/`cashbook`)
- 在线体验后台：[cashbook.oldmoon.top/admin](https://cashbook.oldmoon.top/admin) (体验账号: `admin`/`admin123456`)
- QQ交流群：`564081656`

## 简述（Description）

Cashbook记账本。

- 在数据记录上追求简单、易用、自主可控；
- 在统计分析上力求清晰、美观、简洁有效。

**重要提示：如果需要部署到公网，请自行修改各类环境变量！！！**  
（如：后台账号密码、数据库密码等）

## 开始使用（Get Started）

- [使用说明](https://doc.cashbook.oldmoon.top/guide/)
- [部署手册](https://doc.cashbook.oldmoon.top/deploy/)
- [开发指南](https://doc.cashbook.oldmoon.top/development/)
- [常见问题](https://doc.cashbook.oldmoon.top/question/)

## 版本对照表

请阅读下面的版本对照表，选择适合你的版本进行部署！

|数据库差异|latest(x86_64)|latest(arm64)|指定版本(x86_64)|指定版本(arm64)|
|---|---|---|---|---|
|pgsql(latest)|latest|latest-arm64|4.1.6|4.1.6-arm64|
|pgsql|latest-pgsql|latest-arm64-pgsql|4.1.6-pgsql|4.1.6-arm64-pgsql|
|mysql|latest-mysql|latest-arm64-mysql|4.1.6-mysql|4.1.6-arm64-mysql|
|sqlite|latest-sqlite|latest-arm64-sqlite|4.1.6-sqlite|4.1.6-arm64-sqlite|
|sqlserver|latest-sqlserver|latest-arm64-sqlserver|4.1.6-sqlserver|4.1.6-arm64-sqlserver|

详情请查看 [DockerHub](https://hub.docker.com/repository/docker/dingdangdog/cashbook/tags)

## 主要功能

- [x] 前台后台分离，独立后台方便对系统进行管理；
- [x] 前台注册功能；
- [x] 明暗主题；
- [x] `Docker` 部署；
- [x] 支持 *支付宝CSV* 账单文件导入；
- [x] 支持 *微信CSV* 账单文件导入；
- [x] 支持 *京东金融CSV* 账单文件导入；
- [x] 三方数据导入时，消费类型自动转换（可以自行配置转换结果）；
- [x] 支持 *模板导入* ；
- [x] 直观的消费日历看板；
- [x] 月度账单分析（后期集成个AI？）；
- [x] 美观的数据分析图表，包括图标如下：
  - [x] 支出类型统计饼图；
  - [x] 支付方式统计饼图；
  - [x] 每日流水统计曲线图；
  - [x] 每月流水统计柱状图；
  - [x] 流水归属统计饼图；
- [x] 多用户模式，用户之间数据隔离；
- [x] 多账本模式，账本之间数据独立；
- [x] 需要数据库：Postgre数据库；
- [x] 可以上传小票图片；
- [x] 账本数据快速迁移（账本数据导入/导出）；
- [x] 系统数据快速迁移（系统数据导入/导出）；
- [x] 自助平账（收入/支出抵消）；
- [x] 共享账本（多用户共用一个账本）；
- [ ] 移动端适配（难搞）；
- [ ] 主题系统（没做过，不会做，但想做）；
- [ ] ……

## Star

[![Star History Chart](https://api.star-history.com/svg?repos=dingdangdog/cashbook&type=Date)](https://star-history.com/#dingdangdog/cashbook&Date)

## 贡献者（Contributor）

<a href="https://github.com/dingdangdog/cashbook/graphs/contributors"><img src="https://contrib.rocks/image?repo=dingdangdog/cashbook" /></a>

<!-- ### 开发工具（Tools）

<div style="display:flex; align-item:left">
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/gilbarbara/logos/blob/main/logos/webstorm.svg' width='60px' height='60px'/></a> &nbsp;
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/gilbarbara/logos/blob/main/logos/goland.svg' width='60px' height='60px'/></a> &nbsp;
<a href='https://www.jetbrains.com/community/opensource' ref='nofollow'><img src='https://github.com/get-icon/geticon/blob/master/icons/intellij-idea.svg' width='60px' height='60px'/></a> &nbsp; 
<a href='https://code.visualstudio.com/'><img src='https://github.com/get-icon/geticon/blob/master/icons/visual-studio-code.svg' width='60px' height='60px'/></a>
</div> -->
