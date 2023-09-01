FROM golang:alpine AS binarybuilder

LABEL author.name="DingDangDog"
LABEL author.email="dddogx@qq.com"
LABEL project.name="cashbook-desktop"
LABEL project.version="docker.002"
LABEL project.github="https://github.com/DingDangDog/cashbook-desktop"

RUN apk add --no-cache nginx

WORKDIR /app

# 前端
COPY ./source/books/dist/ ./books/
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./mime.types /etc/nginx/mime.types

RUN nginx -t

# 后端
COPY ./source/server/ ./

RUN rm -f ./resources/data/cashbook.db
RUN rm -rf ./.idea
RUN go env -w GOPROXY=https://goproxy.cn,direct && go mod tidy && go build .

#COPY ./entrypoint.sh ./

VOLUME /app/resources/config
VOLUME /app/resources/data

RUN nginx -t

EXPOSE 80
CMD  ["sh", "-c", "nginx && go run ."]