package router

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

func TestParseAdminWebHosts(t *testing.T) {
	hosts := parseAdminWebHosts("admin.example.com, https://bad.example.com, ADMIN.EXAMPLE.ORG:443, [::1]:3000")

	if _, ok := hosts["admin.example.com"]; !ok {
		t.Fatal("expected admin.example.com to be allowed")
	}
	if _, ok := hosts["admin.example.org"]; !ok {
		t.Fatal("expected admin.example.org to be allowed")
	}
	if _, ok := hosts["::1"]; !ok {
		t.Fatal("expected IPv6 host to be normalized")
	}
	if _, ok := hosts["https://bad.example.com"]; ok {
		t.Fatal("expected hosts with scheme to be ignored")
	}
}

func TestNormalizeRequestHost(t *testing.T) {
	tests := map[string]string{
		"admin.example.com":      "admin.example.com",
		"ADMIN.EXAMPLE.COM:443":  "admin.example.com",
		"[::1]:3000":             "::1",
		"  admin.example.com  ":  "admin.example.com",
		"https://example.com":    "",
		"admin.example.com:3000": "admin.example.com",
	}

	for input, expected := range tests {
		if actual := normalizeRequestHost(input); actual != expected {
			t.Fatalf("normalizeRequestHost(%q) = %q, expected %q", input, actual, expected)
		}
	}
}

func TestApplyEdgeInterfaceLanguageSetsCookieFromCloudflareCountry(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("CF-IPCountry", "CN")
	c.Request = request

	applyEdgeInterfaceLanguage(c)

	if actual := recorder.Header().Get("Content-Language"); actual != "zh" {
		t.Fatalf("Content-Language = %q, expected %q", actual, "zh")
	}
	if !strings.Contains(recorder.Header().Get("Set-Cookie"), common.InterfaceLanguageCookieName+"=zh") {
		t.Fatalf("expected interface language cookie, got %q", recorder.Header().Get("Set-Cookie"))
	}
	if !strings.Contains(recorder.Header().Get("Vary"), "CF-IPCountry") {
		t.Fatalf("expected Vary to include CF-IPCountry, got %q", recorder.Header().Get("Vary"))
	}
}

func TestApplyEdgeInterfaceLanguageSetsTraditionalChineseCookieFromTaiwan(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("CF-IPCountry", "TW")
	c.Request = request

	applyEdgeInterfaceLanguage(c)

	if actual := recorder.Header().Get("Content-Language"); actual != "zh-TW" {
		t.Fatalf("Content-Language = %q, expected %q", actual, "zh-TW")
	}
	if !strings.Contains(recorder.Header().Get("Set-Cookie"), common.InterfaceLanguageCookieName+"=zh-TW") {
		t.Fatalf("expected interface language cookie, got %q", recorder.Header().Get("Set-Cookie"))
	}
}

func TestApplyEdgeInterfaceLanguageKeepsExistingCookie(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("CF-IPCountry", "CN")
	request.AddCookie(&http.Cookie{
		Name:  common.InterfaceLanguageCookieName,
		Value: "ja",
	})
	c.Request = request

	applyEdgeInterfaceLanguage(c)

	if actual := recorder.Header().Get("Content-Language"); actual != "ja" {
		t.Fatalf("Content-Language = %q, expected %q", actual, "ja")
	}
	if cookie := recorder.Header().Get("Set-Cookie"); cookie != "" {
		t.Fatalf("expected no Set-Cookie when valid cookie already exists, got %q", cookie)
	}
}
