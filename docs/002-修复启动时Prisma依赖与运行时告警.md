# 002 修复启动时 Prisma 依赖与运行时告警

## 变更时间

- 2026-04-15

## 问题现象

- 启动时出现 Prisma 运行时文件缺失错误：`query_compiler_fast_bg.postgresql.wasm-base64.mjs`。
- 启动时出现依赖解析告警：`@prisma/extension-accelerate`、`@prisma/adapter-pg` 无法解析。

## 根因分析

- 本地 `node_modules` 与 `package.json`/`package-lock.json` 不一致，导致 Prisma 扩展包未实际安装。
- `prisma/generated` 为旧版本生成结果（`7.4.2`），与当前依赖版本（`7.6.0`）不一致。

## 处理过程

- 执行 `npm install` 同步依赖与锁文件。
- 设置 `DATABASE_URL` 环境变量后执行 `npx prisma generate`，重新生成 Prisma Client。

## 变更文件

- `package.json`
- `package-lock.json`
- `prisma/generated/*`（Prisma 生成文件）

## 验证结果

- 在 `9191` 端口临时启动 `nuxi dev` 验证，启动日志中不再出现上述三个 Prisma 相关错误/告警。
