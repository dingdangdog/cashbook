#!/bin/sh
# 可选参考：当前生产 Dockerfile 在应用启动时通过 server/lib/db-migrations.ts 自动迁移，
# 不再使用本脚本。若改回 Prisma CLI 方式，需在 runner 镜像中安装 prisma 并设置 ENTRYPOINT。
echo "============================================="
echo "欢迎使用 Cashbook"
echo "============================================="
# 打印环境信息
# echo "Checking and creating database if it does not exist..."
echo "Starting application with Prisma database initialization..."
npx prisma migrate deploy
echo "Success Run npx prisma migrate deploy."

# 启动应用程序
echo "Starting application..."
exec node server/index.mjs