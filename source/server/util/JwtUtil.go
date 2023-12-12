package util

import (
	"cashbook-server/service/server"
	"cashbook-server/types"
	"github.com/golang-jwt/jwt"
	"time"
)

// GenerateToken 生成JWT
func GenerateToken(user types.User) (string, error) {
	jwtSecret := []byte(server.GetServerInfo().Secret)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"name": user.Name,
		"id":   user.Id,
		"exp":  time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	return tokenString, err
}

// ParseToken 解析JWT
func ParseToken(tokenString string) (*jwt.Token, *jwt.MapClaims, error) {
	jwtSecret := []byte(server.GetServerInfo().Secret)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil {
		return nil, nil, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, nil, err
	}
	return token, &claims, nil
}

// IsTokenExpired 判断JWT是否过期
func IsTokenExpired(tokenString string) bool {
	_, claims, err := ParseToken(tokenString)
	if err != nil {
		return true
	}
	expiredTime := time.Unix(int64((*claims)["exp"].(float64)), 0)
	return expiredTime.Before(time.Now())
}

// GetUserId 获取token中的用户
func GetUserId(tokenString string) int64 {
	_, claims, _ := ParseToken(tokenString)
	return int64((*claims)["id"].(float64))
}
