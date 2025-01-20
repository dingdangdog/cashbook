#!/bin/sh
echo "============================================="
echo "欢迎使用 Cashbook"
echo "============================================="
# 打印环境信息
# echo "Starting application with Prisma database initialization..."
echo "Checking and creating database if it does not exist..."
npx prisma db execute --url "${DATABASE_URL}" --file "/app/database.sql"
npx prisma migrate deploy
echo "Success Run npx prisma migrate deploy."

# 启动应用程序
echo "Starting application..."
exec node server/index.mjs