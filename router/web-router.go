package router

import (
	"embed"
	"net"
	"net/http"
	"os"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

// ThemeAssets holds the embedded frontend assets for both themes.
type ThemeAssets struct {
	DefaultBuildFS    embed.FS
	DefaultIndexPage  []byte
	ClassicBuildFS    embed.FS
	ClassicIndexPage  []byte
	CustomerBuildFS   embed.FS
	CustomerIndexPage []byte
}

func SetWebRouter(router *gin.Engine, assets ThemeAssets) {
	defaultFS := common.EmbedFolder(assets.DefaultBuildFS, "web/default/dist")
	classicFS := common.EmbedFolder(assets.ClassicBuildFS, "web/classic/dist")
	customerFS := common.EmbedFolder(assets.CustomerBuildFS, "web/customer/dist")
	adminFS := common.NewThemeAwareFS(defaultFS, classicFS)

	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.Cache())
	router.Use(restrictAdminWebHosts())
	router.Use(redirectAdminRootToDashboard())
	router.Use(static.Serve("/admin", adminFS))
	router.Use(static.Serve("/", customerFS))
	router.NoRoute(func(c *gin.Context) {
		c.Set(middleware.RouteTagKey, "web")
		path := c.Request.URL.Path
		if shouldReturnRelayNotFound(path) {
			controller.RelayNotFound(c)
			return
		}
		c.Header("Cache-Control", "no-cache")
		applyEdgeInterfaceLanguage(c)
		if isAdminWebPath(path) && common.GetTheme() == "classic" {
			c.Data(http.StatusOK, "text/html; charset=utf-8", assets.ClassicIndexPage)
			return
		}
		if isAdminWebPath(path) {
			c.Data(http.StatusOK, "text/html; charset=utf-8", assets.DefaultIndexPage)
			return
		}
		c.Data(http.StatusOK, "text/html; charset=utf-8", assets.CustomerIndexPage)
	})
}

func applyEdgeInterfaceLanguage(c *gin.Context) {
	addVaryHeader(c, common.EdgeCountryHeaderNames()...)

	lang := interfaceLanguageFromCookie(c)
	if lang == "" {
		lang = common.InterfaceLanguageFromCountryCode(common.EdgeCountryCodeFromHeaders(c.GetHeader))
		if lang != "" {
			http.SetCookie(c.Writer, &http.Cookie{
				Name:     common.InterfaceLanguageCookieName,
				Value:    lang,
				Path:     "/",
				MaxAge:   common.InterfaceLanguageCookieMaxAge,
				SameSite: http.SameSiteLaxMode,
			})
		}
	}
	if lang != "" {
		c.Header("Content-Language", lang)
	}
}

func interfaceLanguageFromCookie(c *gin.Context) string {
	value, err := c.Cookie(common.InterfaceLanguageCookieName)
	if err != nil {
		return ""
	}
	return common.NormalizeInterfaceLanguage(value)
}

func addVaryHeader(c *gin.Context, values ...string) {
	existing := c.Writer.Header().Get("Vary")
	if strings.TrimSpace(existing) == "*" {
		return
	}

	parts := make([]string, 0, len(values)+1)
	seen := map[string]struct{}{}
	for _, item := range strings.Split(existing, ",") {
		item = strings.TrimSpace(item)
		if item == "" {
			continue
		}
		seen[strings.ToLower(item)] = struct{}{}
		parts = append(parts, item)
	}
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}
		key := strings.ToLower(value)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		parts = append(parts, value)
	}
	if len(parts) > 0 {
		c.Header("Vary", strings.Join(parts, ", "))
	}
}

func restrictAdminWebHosts() gin.HandlerFunc {
	allowedHosts := parseAdminWebHosts(os.Getenv("ADMIN_WEB_HOSTS"))
	return func(c *gin.Context) {
		if len(allowedHosts) == 0 || !isAdminWebPath(c.Request.URL.Path) {
			c.Next()
			return
		}
		if _, ok := allowedHosts[normalizeRequestHost(c.Request.Host)]; ok {
			c.Next()
			return
		}
		c.AbortWithStatus(http.StatusNotFound)
	}
}

func parseAdminWebHosts(raw string) map[string]struct{} {
	hosts := map[string]struct{}{}
	for _, item := range strings.Split(raw, ",") {
		host := normalizeRequestHost(strings.TrimSpace(item))
		if host == "" {
			continue
		}
		hosts[host] = struct{}{}
	}
	return hosts
}

func normalizeRequestHost(host string) string {
	host = strings.TrimSpace(strings.ToLower(host))
	if host == "" {
		return ""
	}
	if strings.Contains(host, "://") {
		return ""
	}
	if h, _, err := net.SplitHostPort(host); err == nil {
		return strings.Trim(strings.ToLower(h), "[]")
	}
	if idx := strings.LastIndex(host, ":"); idx > -1 && strings.Count(host, ":") == 1 {
		return host[:idx]
	}
	return strings.Trim(host, "[]")
}

func redirectAdminRootToDashboard() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		if path != "/admin" && path != "/admin/" {
			c.Next()
			return
		}
		c.Header("Cache-Control", "no-cache")
		c.Redirect(http.StatusFound, getAdminDashboardPath())
		c.Abort()
	}
}

func getAdminDashboardPath() string {
	if common.GetTheme() == "classic" {
		return "/admin/console"
	}
	return "/admin/dashboard/overview"
}

func isAdminWebPath(path string) bool {
	return path == "/admin" || strings.HasPrefix(path, "/admin/")
}

func shouldReturnRelayNotFound(path string) bool {
	apiPrefixes := []string{
		"/api",
		"/v1",
		"/v1beta",
		"/mj",
		"/pg",
		"/assets",
		"/static",
		"/admin/assets",
		"/admin/static",
	}
	for _, prefix := range apiPrefixes {
		if path == prefix || strings.HasPrefix(path, prefix+"/") {
			return true
		}
	}
	return false
}
