package router

import (
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

const customerSEOTestIndexPage = `<!doctype html>
<html lang="zh-CN">
  <head>
    <!--customer-seo-start-->
    <title>Fallback</title>
    <meta name="description" content="Fallback description" />
    <meta name="robots" content="noindex, nofollow" />
    <!--customer-seo-end-->
  </head>
  <body><div id="root"></div></body>
</html>`

func loadCustomerSEOTestConfig(t *testing.T) customerSEOConfig {
	t.Helper()
	data, err := os.ReadFile("../web/customer/src/seo/pages.json")
	require.NoError(t, err)
	config, err := parseCustomerSEOConfig(data)
	require.NoError(t, err)
	return config
}

func TestCustomerSEOConfigResolvesRoutes(t *testing.T) {
	config := loadCustomerSEOTestConfig(t)
	tests := []struct {
		path, language, key, canonical, redirect string
	}{
		{"/", "zh", "home", "/", ""},
		{"/en", "en", "home", "/en", ""},
		{"/pricing", "zh", "pricing", "/pricing", ""},
		{"/en/docs", "en", "docs", "/en/docs", ""},
		{"/subscribe", "zh", "pricing", "/pricing", "/pricing"},
		{"/en/setup", "en", "docs", "/en/docs", "/en/docs"},
	}
	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			result := config.resolve(tt.path)
			require.NotNil(t, result.Page)
			assert.Equal(t, tt.language, result.Language)
			assert.Equal(t, tt.key, result.Page.Key)
			assert.Equal(t, tt.canonical, result.CanonicalPath)
			assert.Equal(t, tt.redirect, result.RedirectPath)
			assert.False(t, result.NoIndex)
			assert.False(t, result.NotFound)
		})
	}
}

func TestCustomerSEOConfigSeparatesNoIndexAndNotFound(t *testing.T) {
	config := loadCustomerSEOTestConfig(t)
	privatePage := config.resolve("/en/dashboard/api-key")
	assert.True(t, privatePage.NoIndex)
	assert.False(t, privatePage.NotFound)
	unknownPage := config.resolve("/en/not-a-real-page")
	assert.True(t, unknownPage.NoIndex)
	assert.True(t, unknownPage.NotFound)
}

func TestParseCustomerSEOConfigValidatesManifest(t *testing.T) {
	tests := []struct {
		name   string
		mutate func(*customerSEOConfig)
	}{
		{
			name: "site URL",
			mutate: func(config *customerSEOConfig) {
				config.SiteURL = "https://example.com"
			},
		},
		{
			name: "production host",
			mutate: func(config *customerSEOConfig) {
				config.ProductionHost = "example.com"
			},
		},
		{
			name: "localized page text",
			mutate: func(config *customerSEOConfig) {
				config.Pages[0].Title.En = ""
			},
		},
		{
			name: "page key",
			mutate: func(config *customerSEOConfig) {
				config.Pages[0].Key = ""
			},
		},
		{
			name: "duplicate page key",
			mutate: func(config *customerSEOConfig) {
				config.Pages[1].Key = config.Pages[0].Key
			},
		},
		{
			name: "canonical path",
			mutate: func(config *customerSEOConfig) {
				config.Pages[1].Path = config.Pages[0].Path
			},
		},
		{
			name: "alias",
			mutate: func(config *customerSEOConfig) {
				config.Pages[2].Aliases = append(config.Pages[2].Aliases, config.Pages[1].Aliases[0])
			},
		},
		{
			name: "alias colliding with canonical path",
			mutate: func(config *customerSEOConfig) {
				config.Pages[1].Aliases = append(config.Pages[1].Aliases, config.Pages[2].Path)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			config := loadCustomerSEOTestConfig(t)
			tt.mutate(&config)
			data, err := common.Marshal(config)
			require.NoError(t, err)
			_, err = parseCustomerSEOConfig(data)
			require.Error(t, err)
		})
	}
}

func TestCustomerSEOServiceServesRouteMetadata(t *testing.T) {
	configBytes, err := os.ReadFile("../web/customer/src/seo/pages.json")
	require.NoError(t, err)
	service, err := newCustomerSEOService(configBytes, []byte(customerSEOTestIndexPage))
	require.NoError(t, err)

	tests := []struct {
		name             string
		path             string
		host             string
		status           int
		language         string
		contentLanguage  string
		robots           string
		title            string
		canonical        string
		canonicalPresent bool
	}{
		{
			name:             "Chinese home on production host",
			path:             "/",
			host:             "aitokensflux.com",
			status:           http.StatusOK,
			language:         "zh-CN",
			contentLanguage:  "zh-CN",
			robots:           "index, follow",
			title:            "AI Tokens Flux｜Claude Code、Codex、Grok API 统一网关",
			canonical:        "https://aitokensflux.com/",
			canonicalPresent: true,
		},
		{
			name:             "English docs on production host",
			path:             "/en/docs",
			host:             "aitokensflux.com",
			status:           http.StatusOK,
			language:         "en",
			contentLanguage:  "en",
			robots:           "index, follow",
			title:            "Claude Code &amp; Codex API Setup Guide | AI Tokens Flux",
			canonical:        "https://aitokensflux.com/en/docs",
			canonicalPresent: true,
		},
		{
			name:             "private dashboard route",
			path:             "/dashboard/api-key",
			host:             "aitokensflux.com",
			status:           http.StatusOK,
			language:         "zh-CN",
			robots:           "noindex, nofollow",
			title:            "AI Tokens Flux",
			canonicalPresent: false,
		},
		{
			name:             "public route on preview host",
			path:             "/pricing",
			host:             "preview.example.com",
			status:           http.StatusOK,
			language:         "zh-CN",
			contentLanguage:  "zh-CN",
			robots:           "noindex, nofollow",
			title:            "Claude Code、Codex、Grok API 价格｜AI Tokens Flux",
			canonical:        "https://aitokensflux.com/pricing",
			canonicalPresent: true,
		},
		{
			name:             "unknown route",
			path:             "/missing-page",
			host:             "aitokensflux.com",
			status:           http.StatusNotFound,
			language:         "zh-CN",
			robots:           "noindex, nofollow",
			title:            "AI Tokens Flux",
			canonicalPresent: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			recorder := performCustomerSEORequest(t, service, tt.path, tt.host)
			body := recorder.Body.String()

			assert.Equal(t, tt.status, recorder.Code)
			assert.Equal(t, tt.contentLanguage, recorder.Header().Get("Content-Language"))
			assert.Contains(t, body, `lang="`+tt.language+`"`)
			assert.Contains(t, body, `<meta name="robots" content="`+tt.robots+`"`)
			assert.Contains(t, body, `<title>`+tt.title+`</title>`)
			if tt.canonicalPresent {
				assert.Contains(t, body, `<link rel="canonical" href="`+tt.canonical+`"`)
			} else {
				assert.NotContains(t, body, `rel="canonical"`)
				assert.NotContains(t, body, `hreflang=`)
			}
		})
	}
}

func TestCustomerSEOServiceRedirectsAliasesWithoutQuery(t *testing.T) {
	configBytes, err := os.ReadFile("../web/customer/src/seo/pages.json")
	require.NoError(t, err)
	service, err := newCustomerSEOService(configBytes, []byte(customerSEOTestIndexPage))
	require.NoError(t, err)

	recorder := performCustomerSEORequest(t, service, "/en/setup?source=legacy", "aitokensflux.com")

	assert.Equal(t, http.StatusMovedPermanently, recorder.Code)
	assert.Equal(t, "/en/docs", recorder.Header().Get("Location"))
}

func TestCustomerSEOServiceEmitsParseableJSONLD(t *testing.T) {
	configBytes, err := os.ReadFile("../web/customer/src/seo/pages.json")
	require.NoError(t, err)
	service, err := newCustomerSEOService(configBytes, []byte(customerSEOTestIndexPage))
	require.NoError(t, err)

	recorder := performCustomerSEORequest(t, service, "/", "aitokensflux.com")
	body := recorder.Body.String()
	startMarker := `<script type="application/ld+json">`
	start := strings.Index(body, startMarker)
	require.NotEqual(t, -1, start)
	start += len(startMarker)
	end := strings.Index(body[start:], "</script>")
	require.NotEqual(t, -1, end)

	var graph map[string]any
	require.NoError(t, common.Unmarshal([]byte(body[start:start+end]), &graph))
	assert.Equal(t, "https://schema.org", graph["@context"])
	assert.NotEmpty(t, graph["@graph"])
}

func TestCustomerSEOServiceCacheSeparatesPublicKeysFromInternalRouteKinds(t *testing.T) {
	for _, pageKey := range []string{"private", "not-found"} {
		t.Run(pageKey, func(t *testing.T) {
			config := loadCustomerSEOTestConfig(t)
			config.Pages[1].Key = pageKey
			configBytes, err := common.Marshal(config)
			require.NoError(t, err)

			orders := []struct {
				name  string
				paths []string
			}{
				{name: "public then internal", paths: []string{"/pricing", "/dashboard/api-key", "/missing-page"}},
				{name: "internal then public", paths: []string{"/dashboard/api-key", "/missing-page", "/pricing"}},
			}
			for _, order := range orders {
				t.Run(order.name, func(t *testing.T) {
					service, err := newCustomerSEOService(configBytes, []byte(customerSEOTestIndexPage))
					require.NoError(t, err)

					responses := make(map[string]*httptest.ResponseRecorder, len(order.paths))
					for _, path := range order.paths {
						responses[path] = performCustomerSEORequest(t, service, path, "preview.example.com")
					}

					publicBody := responses["/pricing"].Body.String()
					assert.Equal(t, http.StatusOK, responses["/pricing"].Code)
					assert.Contains(t, publicBody, `rel="canonical"`)
					assert.Contains(t, publicBody, `hreflang=`)
					assert.Contains(t, publicBody, `application/ld+json`)

					privateBody := responses["/dashboard/api-key"].Body.String()
					assert.Equal(t, http.StatusOK, responses["/dashboard/api-key"].Code)
					assert.NotContains(t, privateBody, `rel="canonical"`)
					assert.NotContains(t, privateBody, `hreflang=`)
					assert.NotContains(t, privateBody, `application/ld+json`)

					unknownBody := responses["/missing-page"].Body.String()
					assert.Equal(t, http.StatusNotFound, responses["/missing-page"].Code)
					assert.NotContains(t, unknownBody, `rel="canonical"`)
					assert.NotContains(t, unknownBody, `hreflang=`)
					assert.NotContains(t, unknownBody, `application/ld+json`)
				})
			}
		})
	}
}

func performCustomerSEORequest(t *testing.T, service *customerSEOService, target, host string) *httptest.ResponseRecorder {
	t.Helper()
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	request := httptest.NewRequest(http.MethodGet, target, nil)
	request.Host = host
	c.Request = request

	service.servePage(c)
	return recorder
}

func TestCustomerWebNoRouteHandlerPreservesOrderingAndLanguageOwnership(t *testing.T) {
	configBytes, err := os.ReadFile("../web/customer/src/seo/pages.json")
	require.NoError(t, err)
	service, err := newCustomerSEOService(configBytes, []byte(customerSEOTestIndexPage))
	require.NoError(t, err)
	assets := ThemeAssets{
		DefaultIndexPage:  []byte("default admin"),
		ClassicIndexPage:  []byte("classic admin"),
		CustomerIndexPage: []byte(customerSEOTestIndexPage),
	}

	t.Run("public URL language overrides edge language", func(t *testing.T) {
		recorder := performCustomerWebNoRouteRequest(t, customerWebNoRouteHandler(assets, service), "/en/docs", "aitokensflux.com", "CN")

		assert.Equal(t, http.StatusOK, recorder.Code)
		assert.Equal(t, "en", recorder.Header().Get("Content-Language"))
		assert.Contains(t, recorder.Body.String(), `lang="en"`)
	})

	t.Run("admin HTML remains ahead of customer service", func(t *testing.T) {
		originalTheme := common.GetTheme()
		common.SetTheme("default")
		t.Cleanup(func() { common.SetTheme(originalTheme) })

		recorder := performCustomerWebNoRouteRequest(t, customerWebNoRouteHandler(assets, service), "/admin/dashboard/overview", "admin.example.com", "CN")

		assert.Equal(t, http.StatusOK, recorder.Code)
		assert.Equal(t, "zh", recorder.Header().Get("Content-Language"))
		assert.Equal(t, "default admin", recorder.Body.String())
	})

	t.Run("relay paths remain real API 404 responses", func(t *testing.T) {
		recorder := performCustomerWebNoRouteRequest(t, customerWebNoRouteHandler(assets, service), "/v1/missing", "aitokensflux.com", "")

		assert.Equal(t, http.StatusNotFound, recorder.Code)
		assert.Contains(t, recorder.Header().Get("Content-Type"), "application/json")
		assert.NotContains(t, recorder.Body.String(), "Fallback")
	})
}

func TestSafeCustomerSEOServiceServesNoIndexFallbackAndReal404(t *testing.T) {
	configBytes, err := os.ReadFile("../web/customer/src/seo/pages.json")
	require.NoError(t, err)
	service := newSafeCustomerSEOService(configBytes, []byte(customerSEOTestIndexPage))

	root := performCustomerSEORequest(t, service, "/", "aitokensflux.com")
	assert.Equal(t, http.StatusOK, root.Code)
	assert.Contains(t, root.Body.String(), "noindex, nofollow")
	missing := performCustomerSEORequest(t, service, "/missing", "aitokensflux.com")
	assert.Equal(t, http.StatusNotFound, missing.Code)
}

func TestSafeCustomerSEOServiceClassifiesRoutesWhenConfigIsMalformed(t *testing.T) {
	service := newSafeCustomerSEOService([]byte("{"), []byte(customerSEOTestIndexPage))

	for _, path := range []string{"/sign-in", "/en/dashboard/api-key"} {
		t.Run(path, func(t *testing.T) {
			recorder := performCustomerSEORequest(t, service, path, "aitokensflux.com")
			assert.Equal(t, http.StatusOK, recorder.Code)
			assert.Contains(t, recorder.Body.String(), "noindex, nofollow")
		})
	}

	missing := performCustomerSEORequest(t, service, "/missing-fallback-route", "aitokensflux.com")
	assert.Equal(t, http.StatusNotFound, missing.Code)
}

func TestSafeCustomerSEOServicePreservesExplicitEnglishForPublicRoute(t *testing.T) {
	configBytes, err := os.ReadFile("../web/customer/src/seo/pages.json")
	require.NoError(t, err)
	invalidTemplate := []byte(`<!doctype html><html lang="zh-CN"><head><meta name="robots" content="noindex, nofollow" /></head></html>`)
	service := newSafeCustomerSEOService(configBytes, invalidTemplate)
	assets := ThemeAssets{CustomerIndexPage: invalidTemplate}

	recorder := performCustomerWebNoRouteRequest(t, customerWebNoRouteHandler(assets, service), "/en/docs", "aitokensflux.com", "CN")

	assert.Equal(t, http.StatusOK, recorder.Code)
	assert.Equal(t, "en", recorder.Header().Get("Content-Language"))
	assert.Contains(t, recorder.Body.String(), `lang="en"`)
	assert.Contains(t, recorder.Body.String(), "noindex, nofollow")
}

func performCustomerWebNoRouteRequest(t *testing.T, handler gin.HandlerFunc, target, host, country string) *httptest.ResponseRecorder {
	t.Helper()
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.NoRoute(handler)
	request := httptest.NewRequest(http.MethodGet, target, nil)
	request.Host = host
	if country != "" {
		request.Header.Set("CF-IPCountry", country)
	}
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)
	return recorder
}
