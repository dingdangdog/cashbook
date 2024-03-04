FROM golang:alpine AS binarybuilder

LABEL author.name="DingDangDog"
LABEL author.email="dingdangdogx@outlook.com"
LABEL project.name="cashbook-desktop"
LABEL project.version="v1.1.6"
LABEL project.github="https://github.com/DingDangDog/cashbook-desktop"


WORKDIR /app

# 后端
COPY ./source/server/ .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o cashbook .

# 构建最终镜像
FROM alpine:latest

RUN apk add --no-cache nginx

WORKDIR /app

COPY --from=binarybuilder /app/cashbook .
RUN mkdir -p /app/resources/app/config
COPY ./docker/server.json /app/resources/app/config/server.json
# 前端
COPY ./source/books/dist/ ./books/
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/mime.types /etc/nginx/mime.types

RUN nginx -t
# 设置环境变量等

VOLUME /app/resources

# 运行应用
#CMD ["./cashbook"]
EXPOSE 80
CMD  ["sh", "-c", "nginx && ./cashbook"]