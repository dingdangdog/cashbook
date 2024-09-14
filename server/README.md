# Server

## Run

```shell
go build main.go
```

## 开发

```sh
set SERVER_KEY=testkey
set DEFAULT_PASSWORD=cashbook
go run .
```

## Package exe

```shell
set GOOS=windows
set GOARCH=amd64
```

```shell
#go build -o name.exe

# 打包一个无窗口的后台exe程序
go build -ldflags="-H windowsgui" -o cashbook-server.exe
```
