package router

import (
	"embed"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

//go:embed web
var webRouterTestBuildFS embed.FS

func TestSetWebRouterPreservesCustomerSEOAndNotFoundContracts(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("ADMIN_WEB_HOSTS", "")
	originalTheme := common.GetTheme()
	common.SetTheme("default")
	t.Cleanup(func() { common.SetTheme(originalTheme) })

	defaultIndex, err := webRouterTestBuildFS.ReadFile("web/default/dist/index.html")
	require.NoError(t, err)
	classicIndex, err := webRouterTestBuildFS.ReadFile("web/classic/dist/index.html")
	require.NoError(t, err)
	customerIndex, err := webRouterTestBuildFS.ReadFile("web/customer/dist/index.html")
	require.NoError(t, err)
	customerSEOConfig, err := os.ReadFile("../web/customer/src/seo/pages.json")
	require.NoError(t, err)

	engine := gin.New()
	SetWebRouter(engine, ThemeAssets{
		DefaultBuildFS:    webRouterTestBuildFS,
		DefaultIndexPage:  defaultIndex,
		ClassicBuildFS:    webRouterTestBuildFS,
		ClassicIndexPage:  classicIndex,
		CustomerBuildFS:   webRouterTestBuildFS,
		CustomerIndexPage: customerIndex,
		CustomerSEOConfig: customerSEOConfig,
	})
	request := func(target, host string) *httptest.ResponseRecorder {
		t.Helper()
		recorder := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, target, nil)
		req.Host = host
		engine.ServeHTTP(recorder, req)
		return recorder
	}

	subscribe := request("/subscribe", "aitokensflux.com")
	docs := request("/en/docs", "aitokensflux.com")
	encodedDocs := request("/%64ocs", "aitokensflux.com")
	encodedEnglishDocs := request("/en/%64ocs", "aitokensflux.com")
	encodedTrailingSlashDocs := request("/docs%2F", "aitokensflux.com")
	encodedLeadingSlashDocs := request("/%2Fdocs", "aitokensflux.com")
	missing := request("/definitely-missing", "aitokensflux.com")
	relayMissing := request("/v1/definitely-missing", "aitokensflux.com")

	assert.Equal(t, http.StatusMovedPermanently, subscribe.Code)
	assert.Equal(t, "/pricing", subscribe.Header().Get("Location"))
	assert.Equal(t, http.StatusOK, docs.Code)
	assert.Equal(t, http.StatusOK, encodedDocs.Code)
	assert.Contains(t, encodedDocs.Body.String(), `<link rel="canonical" href="https://aitokensflux.com/docs"`)
	assert.Equal(t, http.StatusOK, encodedEnglishDocs.Code)
	assert.Contains(t, encodedEnglishDocs.Body.String(), `<link rel="canonical" href="https://aitokensflux.com/en/docs"`)
	assert.Equal(t, http.StatusOK, encodedTrailingSlashDocs.Code)
	assert.Contains(t, encodedTrailingSlashDocs.Body.String(), `<link rel="canonical" href="https://aitokensflux.com/docs"`)
	assert.Equal(t, http.StatusNotFound, encodedLeadingSlashDocs.Code)
	assert.NotContains(t, encodedLeadingSlashDocs.Body.String(), `rel="canonical"`)
	assert.Equal(t, http.StatusNotFound, missing.Code)
	assert.Contains(t, missing.Header().Get("Content-Type"), "text/html")
	assert.Equal(t, http.StatusNotFound, relayMissing.Code)
	assert.Contains(t, relayMissing.Header().Get("Content-Type"), "application/json")
	assert.NotContains(t, relayMissing.Body.String(), "Customer router fixture")
}

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
