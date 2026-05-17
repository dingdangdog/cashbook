# ==============================================================================
# 阶段 1: BUILDER
# ==============================================================================
FROM node:22.21.1-alpine3.22 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# 构建期不连库；仅生成 Client 与 Nuxt 产物
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cashbook?schema=public"

RUN npx prisma generate
RUN npm run build

# ==============================================================================
# 阶段 2: RUNNER
# ==============================================================================
FROM node:22.21.1-alpine3.22 AS runner

LABEL author.name="DingDangDog"
LABEL author.email="dingdangdogx@outlook.com"
LABEL project.name="cashbook"
LABEL project.version="4"

WORKDIR /app

ENV TZ=Asia/Shanghai

COPY --from=builder /app/.output ./
COPY --from=builder /app/prisma/generated ./prisma/generated
COPY --from=builder /app/prisma/migrations ./prisma/migrations

ENV DATABASE_URL="postgresql://postgres:123456@localhost:5432/cashbook?schema=public"
ENV NUXT_APP_VERSION="4.3.13"
ENV NUXT_DATA_PATH="/app/data"
ENV NUXT_AUTH_SECRET="auth123"
ENV NUXT_ADMIN_USERNAME="admin"
ENV NUXT_ADMIN_PASSWORD="fb35e9343a1c095ce1c1d1eb6973dc570953159441c3ee315ecfefb6ed05f4cc"
ENV PORT="9090"

VOLUME /app/data/

EXPOSE 9090

CMD ["node", "/app/server/index.mjs"]
