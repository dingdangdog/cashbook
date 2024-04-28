FROM golang:alpine AS binarybuilder

LABEL author.name="DingDangDog"
LABEL author.email="dingdangdogx@outlook.com"
LABEL project.name="cashbook-desktop"
LABEL project.version="1.1.8"
LABEL project.github="https://github.com/DingDangDog/cashbook-desktop"


WORKDIR /app

# 后端
COPY ./source/server/ .
# 构建适用于linux的可执行程序
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o cashbook .

# 构建最终镜像
FROM alpine:latest

RUN apk add --no-cache nginx

WORKDIR /app

COPY --from=binarybuilder /app/cashbook .
COPY --from=binarybuilder /app/resources/ ./resources/
COPY --from=binarybuilder /app/default/ ./default/

# 前端
COPY ./source/books/dist/ ./books/
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/mime.types /etc/nginx/mime.types

RUN nginx -t

# 设置环境变量等
VOLUME /app/resources/app/data

# 运行应用
#CMD ["./cashbook"]
EXPOSE 80
CMD  ["sh", "-c", "nginx && ./cashbook"]