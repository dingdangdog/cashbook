# ==============================================================================
# 阶段 1: BUILDER
# ==============================================================================
FROM node:20-alpine3.21 AS builder

WORKDIR /app

# 1. 拷贝 package 文件以利用缓存
COPY package*.json ./

# 2. 安装所有依赖 (如果构建需要 devDependencies)
RUN npm install

COPY . .

# 3. 生成 Prisma Client 和运行构建
RUN npx prisma generate 
RUN npm run build

# ==============================================================================
# 阶段 2: RUNNER (精简版)
# ==============================================================================
FROM node:20-alpine3.21 AS runner

LABEL author.name="DingDangDog"
LABEL author.email="dingdangdogx@outlook.com"
LABEL project.name="cashbook"
LABEL project.version="3"

WORKDIR /app

# 1. 拷贝编译后的 Nuxt/Node.js 应用
#    这应该包含所有代码、静态资源和生产依赖 (node_modules, .prisma/)
COPY --from=builder /app/.output/ ./ 
#COPY --from=builder /app/.output/server/node_modules/ ./node_modules/
#COPY --from=builder /app/.output/server/node_modules/.prisma/ ./.prisma/
COPY ./prisma/ ./prisma/

# 2. 拷贝 entrypoint 脚本
COPY ./docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

RUN npm install -g prisma@6.16.2
# 4. 环境变量设置
#    - 确保 DATABASE_URL 仅用于运行时，如果只是为了 prisma generate，可以删除
#    - 确保所有的敏感信息使用 Secrets 或 Docker Compose/K8s 配置，而非硬编码
ENV DATABASE_URL="postgresql://postgres:123456@localhost:5432/cashbook?schema=public"
ENV NUXT_APP_VERSION="4.3.7"
ENV NUXT_DATA_PATH="/app/data"
ENV NUXT_AUTH_SECRET="auth123"
ENV NUXT_ADMIN_USERNAME="admin"
ENV NUXT_ADMIN_PASSWORD="fb35e9343a1c095ce1c1d1eb6973dc570953159441c3ee315ecfefb6ed05f4cc"
ENV PORT="9090"

VOLUME /app/data/

EXPOSE 9090

ENTRYPOINT ["/app/entrypoint.sh"]