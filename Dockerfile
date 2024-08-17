FROM node:18-alpine AS ui-builder
# 打包前端
WORKDIR /app
COPY ./ui .
RUN npm install && npm run build-only

FROM golang:alpine AS binarybuilder
# 打包后端
WORKDIR /app
COPY ./server/ .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o cashbook .

# 构建最终镜像
FROM alpine:latest

LABEL author.name="DingDangDog"
LABEL author.email="dingdangdogx@outlook.com"
LABEL project.name="cashbook-web"
LABEL project.version="2.0.1"
LABEL project.github="https://github.com/DingDangDog/cashbook-web"

RUN apk add --no-cache nginx

WORKDIR /app
# 后端
COPY --from=binarybuilder /app/cashbook .
COPY --from=binarybuilder /app/resources/ ./resources/
# 前端
COPY --from=ui-builder /app/dist/ ./books/
# Nginx
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/mime.types /etc/nginx/mime.types

RUN nginx -t

# 设置环境变量等
VOLUME /app/resources/data

ENV CASHBOOK_VERSION=2.0.1
ENV TOKEN_SALT=spend-money-like-water
ENV ENVIRONMENT=PRO
ENV SERVER_KEY=08cc0348-061d-4193-af05-b6cc02df28ea
ENV DEFAULT_PASSWORD=cashbook

# 运行应用
#CMD ["./cashbook"]
EXPOSE 80
CMD  ["sh", "-c", "nginx && ./cashbook"]