# 开发说明文档

## 目录

- doc: 一些文档、图片
- docker: 存放 docker 构建/部署 需要使用的一些文件
- images: 一些 demo 截图
- release: 目前是用于构建 windows 桌面程序的一些东西
- scripts: 主要是一些打包发版使用的自动化脚本，如：自动构建docker，自动构建exe安装程序等。
- source: 主代码
  - books: 前端 vue 代码
  - server: 后端 golang 代码

## scripts脚本说明

自定义的脚本已经在根目录的`package.json`中声明，可以直接 `npm` 运行。

- build-books: 打包前端代码为 dist 文件夹；
- build-server：打包后端代码为 exe 程序；
- build-docker: 构建docker镜像，会重新打包一次前端代码再进行构建；
- build-all: 依次进行 前端打包、后端打包、构建docker镜像；
- package: 依次进行 前端打包、后端打包、构建 windows 桌面端；
- up-version: 全局升级版本号
- re-version: 全局降级版本号
- release: 依次执行 前端打包、后端打包、构建 windows 桌面端、构建docker镜像；

### 特殊用法

- 重新打包前端，不重新打包后端，构建docker（本地无原版本docker）

```bash
npm run build-docker
```

- 重新打包前端，重新打包后端，构建docker

```bash
# 本地无原版本docker
npm run build-server
npm run build-docker

# 本地有原版本docker
npm run build-all
```
