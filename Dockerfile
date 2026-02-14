# ==============================================================================
# 阶段 1: BUILDER
# ==============================================================================
FROM node:22-alpine3.21 AS builder

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
FROM node:22-alpine3.21 AS runner

LABEL author.name="DingDangDog"
LABEL author.email="dingdangdogx@outlook.com"
LABEL project.name="cashbook"
LABEL project.version="5"

WORKDIR /app

COPY --from=builder /app/.output/ ./ 
COPY ./prisma/ ./prisma/

# 2. 拷贝 entrypoint 脚本
COPY ./docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# 预装prisma，可以提升容器启动速度，但镜像体积会大很多
RUN npm install -g prisma@7.3.0

ENV DATABASE_URL="postgresql://postgres:123456@localhost:5432/cashbook?schema=public"

ENV NODE_ENV="production"
ENV NUXT_APP_VERSION="4.3.11"
ENV NUXT_DATA_PATH="/app/data"
ENV NUXT_AUTH_SECRET="auth123"

ENV PORT="9090"

VOLUME /app/data/

EXPOSE 9090

ENTRYPOINT ["/app/entrypoint.sh"]