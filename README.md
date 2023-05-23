# cashbook-desktop
cashbook's desktop application

桌面版账本，暂时仅支持`Windows`桌面版。

## 重要说明

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
