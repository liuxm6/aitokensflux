package middleware

import (
	"sync"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var (
	corsHandler     gin.HandlerFunc
	corsHandlerOnce sync.Once
)

func buildCORSConfig() cors.Config {
	config := cors.DefaultConfig()
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"}
	config.AllowHeaders = []string{"*"}
	config.AllowCredentials = true
	config.ExposeHeaders = []string{"Auth-Version"}

	if len(common.SkinOrigins) > 0 {
		config.AllowAllOrigins = false
		config.AllowOrigins = common.SkinOrigins
	} else {
		config.AllowAllOrigins = true
	}
	return config
}

func CORS() gin.HandlerFunc {
	corsHandlerOnce.Do(func() {
		corsHandler = cors.New(buildCORSConfig())
	})
	return corsHandler
}
