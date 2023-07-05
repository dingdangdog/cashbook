<h1 align="center">cashbook-desktop</h1>

<p align="center">
  <img alt="stars" src="https://img.shields.io/github/stars/dingdangdog/cashbook-desktop" />
  <img alt="dorks" src="https://img.shields.io/github/forks/dingdangdog/cashbook-desktop" />
  <img alt="issues-open" src="https://img.shields.io/github/issues/dingdangdog/cashbook-desktop?color=important" />
  <img alt="issues-close" src="https://img.shields.io/github/issues-closed/dingdangdog/cashbook-desktop?color=green" />
  <img alt="license" src="https://img.shields.io/badge/license-MIT-yellow.svg" />
</p>

- cashbook's desktop application

- 桌面版账本，暂时仅支持`Windows`桌面版。

## 目录

- [重要说明](#重要说明)
  - [在线同步](#在线同步)
  - [字典](#字典)
  - [导出导入](#导出导入)
  - [软件升级](#软件升级)
- [截图展示](#截图展示)

## 重要说明

### 在线同步

**功能说明**：2023年6月28日，在线同步功能已上线。要使用在线同步功能，需要`服务器地址`和`服务器授权码`两个信息。

1. 在线同步功能以服务器授权码存储数据，不区分账本（即多个账本可以使用同一个授权码）
2. 目前每次上传的数据都会保存，但下载只会拉取对应授权码最后一次上传的数据。
3. 授权码可能有上传次数限制，但下载不会限制次数。
4. **当前用于支持在线同步的云服务为个人搭建并测试，可能会存在不稳定不安全情况，一旦出现任何问题概不负责。**

- 在线同步功能需要云服务的支持，目前已经搭建了一个可供大家使用的服务，地址为`https://cc.oldmoon.top`。
- 在线同步功能需要服务器授权码，因为功能刚上线，可能会有一些问题，所以给大家提供四个免费的测试授权码：
  - `a1180cee3e414e8386e2bdd08ae940aa`
  - `18a2068db29148848f37a2bec9a21ae7`
  - `25cdafad4b6045869f034561fe5abfd8`
  - `1c58f9d047124952ad52fdf6c481d045`

**再次提示：：**
- 1、每个授权码每天只有三次上传数据的机会，如果测试发现上传失败，可能是因为次数耗尽；
- 2、授权码下载时只会下载最后一次上传的数据，多人使用同一个授权码时可能在造成数据混乱；
- 3、现在还在试用阶段，出现任何问题概不负责；
- 4、想要一个自己使用的授权码，可以联系我；
- 5、该功能后续还会有多个迭代，可能会产生较大变动；
- 6、该功能后期可能会根据使用情况变更为收费功能；
- 7、该功能支持私人搭建云服务，但需要一些技术成本，有兴趣或有能力者可以自行尝试。
- 8、从2023年7月4日开始，测试授权码有效期为180天。
 

### 字典

- 字典类型（distType）是最基础的字典，可以认为是字典的字典，`1	distType	distType	字典类型	1`必须存在，否则不能新增字典类型。
- 消费类型、支付方式字典的`key`和`value`建议保持一致。为了减少代码量和连表操作，统计时直接用的`key`。

### 导出导入

- 导出功能会将当前账本的全部流水统一导出；
- 导出数据为`json`格式文件，若有需要，可将数据随意使用；
- 导出数据可以无缝导入其他设备或账本；
- 导入功能暂时只支持`json`格式，且结构要与本软件导出的结构一致。

### 软件升级

- 经测试，软件升级直接下载新版安装包安装即可，数据会保留（**不要卸载**）
- 升级前建议使用导出功能先将流水数据导出

## 截图展示

### 主界面

![main](./images/black-1.jpg)

![main](./images/light-1.jpg)

### 消费类型统计


![main](./images/black-2.jpg)

![main](./images/light-2.jpg)

### 消费日历

![main](./images/black-3.jpg)

![main](./images/light-3.jpg)


### 字典管理


![main](./images/black-4.jpg)

![main](./images/light-4.jpg)
