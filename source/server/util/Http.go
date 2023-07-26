package util

import (
	"bytes"
	"io"
	"net/http"
)

func PostJson(url string, jsonBody []byte) string {
	// 创建包含请求体的 Reader
	bodyReader := bytes.NewReader(jsonBody)

	// 发起 POST 请求
	resp, err := http.Post(url, "application/json", bodyReader)
	if err != nil {
		CheckErr(err)
		return "error"
	}

	defer resp.Body.Close()

	// 读取响应内容
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		CheckErr(err)
		return "error"
	}

	return string(respBody)
}

func Get(url string) string {
	// 发起 HTTP 请求
	resp, err := http.Get(url)
	if err != nil {
		CheckErr(err)
		return "error"
	}
	defer resp.Body.Close()

	// 读取响应内容
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		CheckErr(err)
		return "error"
	}

	return string(body)
}
