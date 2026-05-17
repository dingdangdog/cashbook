# 004 优化 Docker 构建与启动时数据库迁移

## 变更时间

- 2026-05-17

## 背景

原 `Dockerfile` 在 runner 阶段全局安装 `prisma` CLI，并通过 `entrypoint.sh` 执行 `npx prisma migrate deploy` 后再启动 Node。镜像体积大，且运行期依赖 CLI。

参考 `038-docker-database-migration-sync.md` 与优化版 Dockerfile 样例，改为构建期打包、启动期由应用内迁移运行器同步 schema。

## 主要变更

### Dockerfile

- **builder**：`npm ci` → `prisma generate` → `npm run build`；构建期不连接数据库。
- **runner**：仅拷贝 `.output`、`prisma/generated`、`prisma/migrations`；移除全局 `prisma` 与 `entrypoint.sh`。
- **启动**：`CMD ["node", "/app/server/index.mjs"]`。
- 设置 `TZ=Asia/Shanghai`。

### 应用内迁移

- 新增 `server/lib/db-migrations.ts`：读取 `prisma/migrations/*/migration.sql`，维护 `_prisma_migrations`，支持建库、advisory lock、旧库 baseline。
- `server/plugins/initdata.ts`：在任意 Prisma 查询前 `await ensureDatabaseMigrations()`，再执行系统设置与种子逻辑。
- `package.json` 增加直接依赖 `pg`；补充 `dotenv`、`commander` 开发依赖以修复 Docker 内 `npm ci` / `prisma generate`。

### 运维

- `docker/docker-compose.yaml` 补充 `DATABASE_AUTO_MIGRATE`、`DATABASE_BOOTSTRAP_URL` 注释说明。
- `docker/entrypoint.sh` 标注为可选参考，当前生产路径不再使用。

## 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | 必填，PostgreSQL 连接串 |
| `DATABASE_AUTO_MIGRATE` | 设为 `false` 时跳过自动迁移 |
| `DATABASE_BOOTSTRAP_URL` | 可选，用于 `CREATE DATABASE` 的管理连接 |

## 验证建议

1. `docker build -t cashbook:test .`
2. 使用 `docker/docker-compose.yaml` 启动，观察日志含 `[db:migrate] applied ...` 或 `baselined`。
3. 确认应用可正常登录与读写流水。
