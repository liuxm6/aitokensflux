package router

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"html/template"
	"net/http"
	"regexp"
	"strings"
	"sync"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

const (
	customerSEOSiteURL        = "https://aitokensflux.com"
	customerSEOProductionHost = "aitokensflux.com"
	customerSEOStartMarker    = "<!--customer-seo-start-->"
	customerSEOEndMarker      = "<!--customer-seo-end-->"
	customerSEOLanguageAnchor = `<html lang="zh-CN">`
	customerSEOBrandTitle     = "AI Tokens Flux"
	customerSEOBrandZhDesc    = "AI Tokens Flux 提供 Claude Code、Codex 与 Grok API 统一接入。"
	customerSEOBrandEnDesc    = "AI Tokens Flux provides unified Claude Code, Codex and Grok API access."
)

var customerSEOClosingScriptPattern = regexp.MustCompile(`(?i)</script`)

const customerSEOHeadTemplate = `<!--customer-seo-start-->
<title>{{.Title}}</title>
<meta name="description" content="{{.Description}}" />
<meta name="robots" content="{{.Robots}}" />
{{if .CanonicalURL}}<link rel="canonical" href="{{.CanonicalURL}}" />
<link rel="alternate" hreflang="zh-CN" href="{{.ZhURL}}" />
<link rel="alternate" hreflang="en" href="{{.EnURL}}" />
<link rel="alternate" hreflang="x-default" href="{{.DefaultURL}}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="{{.Title}}" />
<meta property="og:description" content="{{.Description}}" />
<meta property="og:url" content="{{.CanonicalURL}}" />
<meta property="og:image" content="{{.ImageURL}}" />
<meta property="og:locale" content="{{.OpenGraphLocale}}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{{.Title}}" />
<meta name="twitter:description" content="{{.Description}}" />
<meta name="twitter:image" content="{{.ImageURL}}" />
<script type="application/ld+json">{{.JSONLD}}</script>
{{end}}<!--customer-seo-end-->`

const customerSEORobots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /v1/
Disallow: /admin/
Disallow: /oauth/

Sitemap: https://aitokensflux.com/sitemap.xml
`

type customerSEOLocalizedText struct {
	Zh string `json:"zh"`
	En string `json:"en"`
}

type customerSEOFAQ struct {
	Question customerSEOLocalizedText `json:"question"`
	Answer   customerSEOLocalizedText `json:"answer"`
}

type customerSEOPage struct {
	Key         string                   `json:"key"`
	Path        string                   `json:"path"`
	Aliases     []string                 `json:"aliases"`
	Title       customerSEOLocalizedText `json:"title"`
	Description customerSEOLocalizedText `json:"description"`
	Breadcrumb  customerSEOLocalizedText `json:"breadcrumb"`
	Schemas     []string                 `json:"schemas"`
	FAQ         []customerSEOFAQ         `json:"faq"`
}

type customerSEOConfig struct {
	SiteURL         string            `json:"siteUrl"`
	ProductionHost  string            `json:"productionHost"`
	ShareImagePath  string            `json:"shareImagePath"`
	Pages           []customerSEOPage `json:"pages"`
	NoIndexPaths    []string          `json:"noindexPaths"`
	NoIndexPrefixes []string          `json:"noindexPrefixes"`
}

type customerSEOResolution struct {
	Language      string
	Page          *customerSEOPage
	CanonicalPath string
	RedirectPath  string
	NoIndex       bool
	NotFound      bool
}

type customerSEORouteKind uint8

const (
	customerSEORoutePublic customerSEORouteKind = iota
	customerSEORoutePrivate
	customerSEORouteNotFound
)

type customerSEODocumentCacheKey struct {
	RouteKind customerSEORouteKind
	PageKey   string
	Language  string
	Robots    string
	Status    int
}

type customerSEOMetadataView struct {
	Title           string
	Description     string
	Robots          string
	CanonicalURL    string
	ZhURL           string
	EnURL           string
	DefaultURL      string
	ImageURL        string
	OpenGraphLocale string
	JSONLD          template.JS
}

type customerSEOSitemapURLSet struct {
	XMLName    xml.Name                `xml:"urlset"`
	XMLNS      string                  `xml:"xmlns,attr"`
	XMLNSXHTML string                  `xml:"xmlns:xhtml,attr"`
	URLs       []customerSEOSitemapURL `xml:"url"`
}

type customerSEOSitemapURL struct {
	Location   string                        `xml:"loc"`
	Alternates []customerSEOSitemapAlternate `xml:"xhtml:link"`
}

type customerSEOSitemapAlternate struct {
	Rel      string `xml:"rel,attr"`
	Language string `xml:"hreflang,attr"`
	Href     string `xml:"href,attr"`
}

type customerSEOService struct {
	config           customerSEOConfig
	hasConfig        bool
	indexPage        []byte
	headTemplate     *template.Template
	safeFallback     bool
	documentCache    map[customerSEODocumentCacheKey][]byte
	documentCacheMux sync.RWMutex
}

func newCustomerSEOService(configBytes, indexPage []byte) (*customerSEOService, error) {
	config, err := parseCustomerSEOConfig(configBytes)
	if err != nil {
		return nil, err
	}
	if err := validateCustomerSEOIndexPage(indexPage); err != nil {
		return nil, err
	}
	headTemplate, err := template.New("customer-seo-head").Parse(customerSEOHeadTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse customer SEO head template: %w", err)
	}
	return &customerSEOService{
		config:        config,
		hasConfig:     true,
		indexPage:     bytes.Clone(indexPage),
		headTemplate:  headTemplate,
		documentCache: make(map[customerSEODocumentCacheKey][]byte),
	}, nil
}

func newSafeCustomerSEOService(configBytes, indexPage []byte) *customerSEOService {
	service := &customerSEOService{
		indexPage:     bytes.Clone(indexPage),
		safeFallback:  true,
		documentCache: make(map[customerSEODocumentCacheKey][]byte),
	}
	config, err := parseCustomerSEOConfig(configBytes)
	if err == nil {
		service.config = config
		service.hasConfig = true
	}
	return service
}

func validateCustomerSEOIndexPage(indexPage []byte) error {
	if bytes.Count(indexPage, []byte(customerSEOStartMarker)) != 1 || bytes.Count(indexPage, []byte(customerSEOEndMarker)) != 1 {
		return fmt.Errorf("customer index page must contain exactly one SEO marker block")
	}
	start := bytes.Index(indexPage, []byte(customerSEOStartMarker))
	end := bytes.Index(indexPage, []byte(customerSEOEndMarker))
	if start >= end {
		return fmt.Errorf("customer index page SEO markers are out of order")
	}
	if bytes.Count(indexPage, []byte(customerSEOLanguageAnchor)) != 1 {
		return fmt.Errorf("customer index page must contain the exact language anchor %q", customerSEOLanguageAnchor)
	}
	return nil
}

func parseCustomerSEOConfig(data []byte) (customerSEOConfig, error) {
	var config customerSEOConfig
	if err := common.Unmarshal(data, &config); err != nil {
		return customerSEOConfig{}, fmt.Errorf("parse customer SEO config: %w", err)
	}
	if config.SiteURL != customerSEOSiteURL {
		return customerSEOConfig{}, fmt.Errorf("customer SEO siteUrl must be %q", customerSEOSiteURL)
	}
	if config.ProductionHost != customerSEOProductionHost {
		return customerSEOConfig{}, fmt.Errorf("customer SEO productionHost must be %q", customerSEOProductionHost)
	}

	canonicalPaths := make(map[string]struct{}, len(config.Pages))
	aliases := make(map[string]struct{})
	pageKeys := make(map[string]struct{}, len(config.Pages))
	for pageIndex := range config.Pages {
		page := &config.Pages[pageIndex]
		if strings.TrimSpace(page.Key) == "" {
			return customerSEOConfig{}, fmt.Errorf("customer SEO page %d has an empty key", pageIndex)
		}
		if _, exists := pageKeys[page.Key]; exists {
			return customerSEOConfig{}, fmt.Errorf("customer SEO has duplicate page key %q", page.Key)
		}
		pageKeys[page.Key] = struct{}{}
		if strings.TrimSpace(page.Path) == "" {
			return customerSEOConfig{}, fmt.Errorf("customer SEO page %q has an empty path", page.Key)
		}
		if !customerSEOLocalizedTextIsComplete(page.Title) ||
			!customerSEOLocalizedTextIsComplete(page.Description) ||
			!customerSEOLocalizedTextIsComplete(page.Breadcrumb) {
			return customerSEOConfig{}, fmt.Errorf("customer SEO page %q has empty localized text", page.Key)
		}
		for _, faq := range page.FAQ {
			if !customerSEOLocalizedTextIsComplete(faq.Question) || !customerSEOLocalizedTextIsComplete(faq.Answer) {
				return customerSEOConfig{}, fmt.Errorf("customer SEO page %q has empty localized FAQ text", page.Key)
			}
		}

		page.Path = normalizeCustomerSEOPath(page.Path)
		if _, exists := canonicalPaths[page.Path]; exists {
			return customerSEOConfig{}, fmt.Errorf("customer SEO has duplicate canonical path %q", page.Path)
		}
		canonicalPaths[page.Path] = struct{}{}
		for aliasIndex, alias := range page.Aliases {
			alias = normalizeCustomerSEOPath(alias)
			page.Aliases[aliasIndex] = alias
			if _, exists := aliases[alias]; exists {
				return customerSEOConfig{}, fmt.Errorf("customer SEO has duplicate alias %q", alias)
			}
			aliases[alias] = struct{}{}
		}
	}
	for alias := range aliases {
		if _, exists := canonicalPaths[alias]; exists {
			return customerSEOConfig{}, fmt.Errorf("customer SEO alias %q collides with a canonical path", alias)
		}
	}
	for pathIndex, path := range config.NoIndexPaths {
		config.NoIndexPaths[pathIndex] = normalizeCustomerSEOPath(path)
	}
	for prefixIndex, prefix := range config.NoIndexPrefixes {
		config.NoIndexPrefixes[prefixIndex] = normalizeCustomerSEOPath(prefix)
		if strings.HasSuffix(strings.TrimSpace(prefix), "/") && config.NoIndexPrefixes[prefixIndex] != "/" {
			config.NoIndexPrefixes[prefixIndex] += "/"
		}
	}
	return config, nil
}

func customerSEOLocalizedTextIsComplete(text customerSEOLocalizedText) bool {
	return strings.TrimSpace(text.Zh) != "" && strings.TrimSpace(text.En) != ""
}

func normalizeCustomerSEOPath(value string) string {
	path := strings.TrimSpace(value)
	if path == "" || path == "/" {
		return "/"
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	return strings.TrimRight(path, "/")
}

func splitCustomerSEOLanguage(requestPath string) (language, basePath string) {
	path := normalizeCustomerSEOPath(requestPath)
	if path == "/en" {
		return "en", "/"
	}
	if strings.HasPrefix(path, "/en/") {
		return "en", normalizeCustomerSEOPath(strings.TrimPrefix(path, "/en"))
	}
	return "zh", path
}

func customerSEOCanonicalPath(language, basePath string) string {
	path := normalizeCustomerSEOPath(basePath)
	if language != "en" {
		return path
	}
	if path == "/" {
		return "/en"
	}
	return "/en" + path
}

func (config customerSEOConfig) resolve(requestPath string) customerSEOResolution {
	language, basePath := splitCustomerSEOLanguage(requestPath)
	for _, page := range config.Pages {
		if page.Path != basePath {
			continue
		}
		matchedPage := page
		return customerSEOResolution{
			Language:      language,
			Page:          &matchedPage,
			CanonicalPath: customerSEOCanonicalPath(language, page.Path),
		}
	}
	for _, page := range config.Pages {
		for _, alias := range page.Aliases {
			if alias != basePath {
				continue
			}
			matchedPage := page
			canonicalPath := customerSEOCanonicalPath(language, page.Path)
			return customerSEOResolution{
				Language:      language,
				Page:          &matchedPage,
				CanonicalPath: canonicalPath,
				RedirectPath:  canonicalPath,
			}
		}
	}
	for _, path := range config.NoIndexPaths {
		if path == basePath {
			return customerSEOResolution{Language: language, NoIndex: true}
		}
	}
	for _, prefix := range config.NoIndexPrefixes {
		if strings.HasPrefix(basePath, prefix) {
			return customerSEOResolution{Language: language, NoIndex: true}
		}
	}
	return customerSEOResolution{Language: language, NoIndex: true, NotFound: true}
}

func (service *customerSEOService) servePage(c *gin.Context) {
	resolution := customerSEOResolution{Language: "zh", NoIndex: true, NotFound: true}
	fallbackPublic := false
	if service.hasConfig {
		resolution = service.config.resolve(c.Request.URL.Path)
	} else {
		language, public, found := classifyCustomerSEOFallbackPath(c.Request.URL.Path)
		resolution.Language = language
		resolution.NotFound = !found
		fallbackPublic = public
	}

	if resolution.RedirectPath != "" {
		c.Redirect(http.StatusMovedPermanently, resolution.RedirectPath)
		return
	}

	status := http.StatusOK
	if resolution.NotFound {
		status = http.StatusNotFound
	}
	if service.safeFallback {
		document := service.indexPage
		if resolution.Page != nil || fallbackPublic {
			language := customerSEOHTMLLanguage(resolution.Language)
			c.Header("Content-Language", language)
			document = bytes.Replace(document, []byte(customerSEOLanguageAnchor), []byte(`<html lang="`+language+`">`), 1)
		} else {
			applyEdgeInterfaceLanguage(c)
		}
		c.Data(status, "text/html; charset=utf-8", document)
		return
	}

	robots := "noindex, nofollow"
	if resolution.Page != nil && normalizeRequestHost(c.Request.Host) == service.config.ProductionHost {
		robots = "index, follow"
	}
	routeKind := customerSEORoutePrivate
	pageKey := ""
	if resolution.Page != nil {
		routeKind = customerSEORoutePublic
		pageKey = resolution.Page.Key
	} else if resolution.NotFound {
		routeKind = customerSEORouteNotFound
	}
	cacheKey := customerSEODocumentCacheKey{
		RouteKind: routeKind,
		PageKey:   pageKey,
		Language:  resolution.Language,
		Robots:    robots,
		Status:    status,
	}

	document, err := service.document(cacheKey, resolution)
	if err != nil {
		common.SysError("render customer SEO page: " + err.Error())
		applyEdgeInterfaceLanguage(c)
		c.Data(status, "text/html; charset=utf-8", service.indexPage)
		return
	}
	if resolution.Page != nil {
		c.Header("Content-Language", customerSEOHTMLLanguage(resolution.Language))
	} else {
		applyEdgeInterfaceLanguage(c)
	}
	c.Data(status, "text/html; charset=utf-8", document)
}

func (service *customerSEOService) serveRobots(c *gin.Context) {
	c.Data(http.StatusOK, "text/plain; charset=utf-8", []byte(customerSEORobots))
}

func (service *customerSEOService) serveSitemap(c *gin.Context) {
	if !service.hasConfig {
		c.Status(http.StatusNotFound)
		return
	}

	urls := make([]customerSEOSitemapURL, 0, len(service.config.Pages)*2)
	for _, page := range service.config.Pages {
		zhURL := customerSEOAbsoluteURL(service.config.SiteURL, customerSEOCanonicalPath("zh", page.Path))
		enURL := customerSEOAbsoluteURL(service.config.SiteURL, customerSEOCanonicalPath("en", page.Path))
		alternates := []customerSEOSitemapAlternate{
			{Rel: "alternate", Language: "zh-CN", Href: zhURL},
			{Rel: "alternate", Language: "en", Href: enURL},
			{Rel: "alternate", Language: "x-default", Href: zhURL},
		}
		urls = append(urls,
			customerSEOSitemapURL{Location: zhURL, Alternates: alternates},
			customerSEOSitemapURL{Location: enURL, Alternates: alternates},
		)
	}

	document, err := xml.MarshalIndent(customerSEOSitemapURLSet{
		XMLNS:      "http://www.sitemaps.org/schemas/sitemap/0.9",
		XMLNSXHTML: "http://www.w3.org/1999/xhtml",
		URLs:       urls,
	}, "", "  ")
	if err != nil {
		common.SysError("marshal customer sitemap: " + err.Error())
		c.Status(http.StatusInternalServerError)
		return
	}
	document = append([]byte(xml.Header), document...)
	c.Data(http.StatusOK, "application/xml; charset=utf-8", document)
}

func classifyCustomerSEOFallbackPath(requestPath string) (language string, public, found bool) {
	language, basePath := splitCustomerSEOLanguage(requestPath)
	switch basePath {
	case "/", "/pricing", "/subscribe", "/docs", "/setup", "/user-agreement", "/privacy-policy":
		return language, true, true
	case "/dashboard", "/dashboard/billing", "/dashboard/usage", "/dashboard/api-key", "/dashboard/invite-record", "/dashboard/settings",
		"/console/connect", "/atf-switch/connect", "/topup", "/wallet", "/usage", "/usage-logs", "/apikeys", "/keys", "/invite", "/settings",
		"/fathers-day", "/sign-in", "/login", "/register", "/sign-up", "/user/reset", "/reset":
		return language, false, true
	default:
		return language, false, strings.HasPrefix(basePath, "/oauth/")
	}
}

func (service *customerSEOService) document(cacheKey customerSEODocumentCacheKey, resolution customerSEOResolution) ([]byte, error) {
	service.documentCacheMux.RLock()
	document, ok := service.documentCache[cacheKey]
	service.documentCacheMux.RUnlock()
	if ok {
		return document, nil
	}

	metadata, err := service.metadata(resolution, cacheKey.Robots)
	if err != nil {
		return nil, err
	}
	var renderedHead bytes.Buffer
	if err := service.headTemplate.Execute(&renderedHead, metadata); err != nil {
		return nil, fmt.Errorf("execute customer SEO head template: %w", err)
	}

	start := bytes.Index(service.indexPage, []byte(customerSEOStartMarker))
	end := bytes.Index(service.indexPage, []byte(customerSEOEndMarker)) + len(customerSEOEndMarker)
	language := customerSEOHTMLLanguage(resolution.Language)
	document = make([]byte, 0, len(service.indexPage)+renderedHead.Len())
	document = append(document, service.indexPage[:start]...)
	document = append(document, renderedHead.Bytes()...)
	document = append(document, service.indexPage[end:]...)
	document = bytes.Replace(document, []byte(customerSEOLanguageAnchor), []byte(`<html lang="`+language+`">`), 1)

	service.documentCacheMux.Lock()
	if cached, exists := service.documentCache[cacheKey]; exists {
		document = cached
	} else {
		service.documentCache[cacheKey] = document
	}
	service.documentCacheMux.Unlock()
	return document, nil
}

func (service *customerSEOService) metadata(resolution customerSEOResolution, robots string) (customerSEOMetadataView, error) {
	metadata := customerSEOMetadataView{
		Title:       customerSEOBrandTitle,
		Description: customerSEOBrandZhDesc,
		Robots:      robots,
	}
	if resolution.Language == "en" {
		metadata.Description = customerSEOBrandEnDesc
	}
	if resolution.Page == nil {
		return metadata, nil
	}

	page := resolution.Page
	metadata.Title = customerSEOLocalizedValue(page.Title, resolution.Language)
	metadata.Description = customerSEOLocalizedValue(page.Description, resolution.Language)
	metadata.CanonicalURL = customerSEOAbsoluteURL(service.config.SiteURL, resolution.CanonicalPath)
	metadata.ZhURL = customerSEOAbsoluteURL(service.config.SiteURL, customerSEOCanonicalPath("zh", page.Path))
	metadata.EnURL = customerSEOAbsoluteURL(service.config.SiteURL, customerSEOCanonicalPath("en", page.Path))
	metadata.DefaultURL = metadata.ZhURL
	metadata.ImageURL = customerSEOAbsoluteURL(service.config.SiteURL, service.config.ShareImagePath)
	metadata.OpenGraphLocale = "zh_CN"
	if resolution.Language == "en" {
		metadata.OpenGraphLocale = "en_US"
	}

	graph := service.structuredDataGraph(*page, resolution.Language, metadata)
	jsonData, err := common.Marshal(map[string]any{
		"@context": "https://schema.org",
		"@graph":   graph,
	})
	if err != nil {
		return customerSEOMetadataView{}, fmt.Errorf("marshal customer SEO structured data: %w", err)
	}
	jsonData = customerSEOClosingScriptPattern.ReplaceAll(jsonData, []byte(`<\\/script`))
	metadata.JSONLD = template.JS(jsonData)
	return metadata, nil
}

func (service *customerSEOService) structuredDataGraph(page customerSEOPage, language string, metadata customerSEOMetadataView) []any {
	rootURL := customerSEOAbsoluteURL(service.config.SiteURL, "/")
	graph := []any{
		map[string]any{
			"@type":       "WebPage",
			"@id":         metadata.CanonicalURL + "#webpage",
			"url":         metadata.CanonicalURL,
			"name":        metadata.Title,
			"description": metadata.Description,
			"inLanguage":  customerSEOHTMLLanguage(language),
			"isPartOf": map[string]any{
				"@id": rootURL + "#website",
			},
		},
	}
	if page.Key == "home" {
		graph = append(graph,
			map[string]any{
				"@type": "Organization",
				"@id":   rootURL + "#organization",
				"name":  customerSEOBrandTitle,
				"url":   rootURL,
			},
			map[string]any{
				"@type":      "WebSite",
				"@id":        rootURL + "#website",
				"url":        rootURL,
				"name":       customerSEOBrandTitle,
				"inLanguage": customerSEOHTMLLanguage(language),
				"publisher": map[string]any{
					"@id": rootURL + "#organization",
				},
			},
			map[string]any{
				"@type":       "Service",
				"@id":         rootURL + "#service",
				"name":        customerSEOBrandTitle,
				"description": metadata.Description,
				"url":         metadata.CanonicalURL,
				"provider": map[string]any{
					"@id": rootURL + "#organization",
				},
			},
			map[string]any{
				"@type":      "FAQPage",
				"@id":        metadata.CanonicalURL + "#faq",
				"mainEntity": customerSEOFAQEntities(page.FAQ, language),
			},
		)
		return graph
	}

	homePath := customerSEOCanonicalPath(language, "/")
	graph = append(graph, map[string]any{
		"@type": "BreadcrumbList",
		"@id":   metadata.CanonicalURL + "#breadcrumb",
		"itemListElement": []any{
			map[string]any{
				"@type":    "ListItem",
				"position": 1,
				"name":     customerSEOHomeBreadcrumb(language),
				"item":     customerSEOAbsoluteURL(service.config.SiteURL, homePath),
			},
			map[string]any{
				"@type":    "ListItem",
				"position": 2,
				"name":     customerSEOLocalizedValue(page.Breadcrumb, language),
				"item":     metadata.CanonicalURL,
			},
		},
	})
	return graph
}

func customerSEOFAQEntities(faqs []customerSEOFAQ, language string) []any {
	entities := make([]any, 0, len(faqs))
	for _, faq := range faqs {
		entities = append(entities, map[string]any{
			"@type": "Question",
			"name":  customerSEOLocalizedValue(faq.Question, language),
			"acceptedAnswer": map[string]any{
				"@type": "Answer",
				"text":  customerSEOLocalizedValue(faq.Answer, language),
			},
		})
	}
	return entities
}

func customerSEOLocalizedValue(value customerSEOLocalizedText, language string) string {
	if language == "en" {
		return value.En
	}
	return value.Zh
}

func customerSEOHTMLLanguage(language string) string {
	if language == "en" {
		return "en"
	}
	return "zh-CN"
}

func customerSEOAbsoluteURL(siteURL, path string) string {
	return strings.TrimRight(siteURL, "/") + normalizeCustomerSEOPath(path)
}

func customerSEOHomeBreadcrumb(language string) string {
	if language == "en" {
		return "Home"
	}
	return "首页"
}
