# 001 — 移除资金账户 `accountType` 字段

## 日期

2026-03-22

## 背景

资金账户以「账户名称」区分即可，无需再维护单独的「账户类型」枚举字段；类型语义由名称体现。

## 变更摘要

- **Prisma**：`FundAccount` 删除 `accountType` 字段及 `@@index([userId, accountType])`。
- **数据库**：新增迁移 `20260322120000_remove_fund_account_account_type`，删除列与复合索引。
- **服务端**：账户增删改查、按 `payType` 匹配账户、AI 工具与说明文案中移除对 `accountType` 的读写与过滤。
- **前端**：资金账户管理页去掉类型表单项与校验；流水/导入相关类型与匹配逻辑仅依赖账户名称。

## 部署注意

已有数据库需执行迁移（如 `pnpm prisma migrate deploy`），再部署应用。
