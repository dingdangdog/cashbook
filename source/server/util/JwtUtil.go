package util

import (
	"cashbook-server/service/server"
	"cashbook-server/types"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"time"
)

// GenerateToken 生成JWT
func GenerateToken(rememberFlag bool, user types.User) (string, error) {
	jwtSecret := []byte(server.GetServerInfo().Secret)
	defaultExpiredTime := time.Now().Add(time.Hour * 24).Unix()
	if rememberFlag {
		// set default expired time to forever(100 years)
		defaultExpiredTime = time.Now().Add(time.Hour * 24 * 365 * 100).Unix()
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"name": user.Name,
		"id":   user.Id,
		"exp":  defaultExpiredTime,
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
func GetUserId(c *gin.Context) int64 {
	token := c.Request.Header.Get("token")
	_, claims, _ := ParseToken(token)
	return int64((*claims)["id"].(float64))
}
