# 005 修复迁移校验 CRLF 误报 checksum mismatch

## 变更时间

- 2026-05-17

## 现象

本地 `nuxt dev` 启动报错：

```
Migration checksum mismatch: 20250116134313_init. Existing databases cannot safely apply a modified migration file.
```

迁移 SQL 文件内容未改，仍被判定为「不安全」。

## 原因

- 数据库中 `_prisma_migrations.checksum` 由 **Prisma CLI** 写入，计算前会把文件中的 `\r\n` 规范为 `\n` 再 SHA-256。
- Windows 工作区里 `migration.sql` 常为 **CRLF** 行尾；自定义运行器若直接对原始字节哈希，会得到不同 checksum，从而误报 mismatch。

实测 `20250116134313_init`：

| 方式 | checksum（前 8 位） |
|------|---------------------|
| 库内（Prisma 写入） | `4b395076` |
| 对 CRLF 文件直接哈希 | `f1c27b14`（不一致） |
| 对 CRLF→LF 后再哈希 | `4b395076`（一致） |

## 修复

`server/lib/db-migrations.ts` 的 `getChecksum` 在哈希前执行 `sql.replace(/\r\n/g, "\n")`，与 Prisma 行为对齐。

## 变更文件

- `server/lib/db-migrations.ts`
