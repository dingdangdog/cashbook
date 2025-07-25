FROM node:20-alpine3.21 AS builder

WORKDIR /app

COPY package*.json ./

# 安装依赖并生成 Prisma Client
RUN npm install

COPY . .

RUN npx prisma generate 
RUN npm run build
# RUN npm run prisma:build

FROM node:20-alpine3.21 AS runner

LABEL author.name="DingDangDog"
LABEL author.email="dingdangdogx@outlook.com"
LABEL project.name="cashbook"
LABEL project.version="3"

WORKDIR /app

# 复制生产环境需要的文件
COPY --from=builder /app/.output/ ./ 
COPY --from=builder /app/.output/server/node_modules/ ./node_modules/
COPY --from=builder /app/.output/server/node_modules/.prisma/ ./.prisma/
COPY ./prisma/ ./prisma/
COPY ./docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# RUN ls

# 预装prisma，可以提升容器启动速度，但镜像体积会大很多
RUN npm install -g prisma@6.10.1
ENV DATABASE_URL="postgresql://postgres:123456@localhost:5432/cashbook?schema=public"

ENV NUXT_APP_VERSION="4.3.3"
ENV NUXT_DATA_PATH="/app/data"

ENV NUXT_AUTH_SECRET="auth123"

ENV NUXT_ADMIN_USERNAME="admin"
# 密码是加密后的，加密方法见 server/utils 中的 test.js 或 common.ts
ENV NUXT_ADMIN_PASSWORD="fb35e9343a1c095ce1c1d1eb6973dc570953159441c3ee315ecfefb6ed05f4cc"

ENV PORT="9090"

VOLUME /app/data/

EXPOSE 9090
# ENTRYPOINT [ "sh","entrypoint.sh" ]
ENTRYPOINT ["/app/entrypoint.sh"]
# CMD ["/app/entrypoint.sh"]
