FROM golang:alpine AS binarybuilder

LABEL author.name="DingDangDog"
LABEL author.email="dddogx@qq.com"
LABEL project.name="cashbook-desktop"
LABEL project.version="docker.001"
LABEL project.github="https://github.com/DingDangDog/cashbook-desktop"

# 后端
WORKDIR /app
COPY ./source/server/ ./
RUN rm -f ./data/cashbook.db

COPY ./entrypoint.sh ./
RUN go env -w GOPROXY=https://goproxy.cn,direct && go mod tidy && go build .

# 前端
RUN apk add --no-cache nginx

COPY ./source/books/dist/ ./books/
COPY ./nginx.conf ./nginx.conf
COPY ./mime.types ./mime.types

VOLUME ["/app/config"]
VOLUME ["/app/data"]

EXPOSE 80
ENTRYPOINT [ "sh","/app/entrypoint.sh" ]