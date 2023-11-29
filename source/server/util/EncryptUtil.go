package util

// 引入第三方md5库
import (
	"crypto/sha256"
	"encoding/hex"
)

// EncryptBySHA256 使用 SHA-256 算法加密字符串
func EncryptBySHA256(userName string, password string) string {
	// 创建 SHA-256 哈希对象
	hasher := sha256.New()
	// 将字符串转换为字节并写入哈希对象
	hasher.Write([]byte(userName + password))
	// 计算 SHA-256 哈希值
	hashInBytes := hasher.Sum(nil)
	// 将哈希值转换为16进制字符串
	hashString := hex.EncodeToString(hashInBytes)
	return hashString
}
