package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/i18n"
	"github.com/gin-gonic/gin"
)

func TestDetectLanguageUsesInterfaceLanguageCookieBeforeEdgeCountry(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	request := httptest.NewRequest(http.MethodGet, "/api/status", nil)
	request.Header.Set("CF-IPCountry", "CN")
	request.AddCookie(&http.Cookie{
		Name:  common.InterfaceLanguageCookieName,
		Value: "en",
	})
	c.Request = request

	if actual := detectLanguage(c); actual != i18n.LangEn {
		t.Fatalf("detectLanguage() = %q, expected %q", actual, i18n.LangEn)
	}
}

func TestDetectLanguageUsesEdgeCountryBeforeAcceptLanguage(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	request := httptest.NewRequest(http.MethodGet, "/api/status", nil)
	request.Header.Set("CF-IPCountry", "CN")
	request.Header.Set("Accept-Language", "en-US,en;q=0.9")
	c.Request = request

	if actual := detectLanguage(c); actual != i18n.LangZhCN {
		t.Fatalf("detectLanguage() = %q, expected %q", actual, i18n.LangZhCN)
	}
}
