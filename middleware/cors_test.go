package middleware

import (
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestCORSReflectsSkinOrigin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	common.SkinOrigins = []string{"https://skin.example.com"}
	corsHandlerOnce = sync.Once{}
	corsHandler = nil

	router := gin.New()
	router.Use(CORS())
	router.POST("/api/user/login", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodOptions, "/api/user/login", nil)
	req.Header.Set("Origin", "https://skin.example.com")
	req.Header.Set("Access-Control-Request-Method", "POST")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	require.Equal(t, http.StatusNoContent, rec.Code)
	require.Equal(t, "https://skin.example.com", rec.Header().Get("Access-Control-Allow-Origin"))
	require.Equal(t, "true", rec.Header().Get("Access-Control-Allow-Credentials"))
}
