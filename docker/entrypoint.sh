#!/bin/sh
echo "============================================="
echo "欢迎使用 Cashbook"
echo "============================================="
# 打印环境信息
# echo "Checking and creating database if it does not exist..."
echo "Starting application with Prisma database initialization..."
prisma migrate deploy --schema ./prisma/schema.prisma
echo "Success: prisma migrate deploy."

# 启动应用程序
echo "Starting application..."
exec node server/index.mjs