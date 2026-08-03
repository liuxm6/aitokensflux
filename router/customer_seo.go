package router

import (
	"fmt"
	"strings"

	"github.com/QuantumNous/new-api/common"
)

const (
	customerSEOSiteURL        = "https://aitokensflux.com"
	customerSEOProductionHost = "aitokensflux.com"
)

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
	for pageIndex := range config.Pages {
		page := &config.Pages[pageIndex]
		if strings.TrimSpace(page.Key) == "" {
			return customerSEOConfig{}, fmt.Errorf("customer SEO page %d has an empty key", pageIndex)
		}
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
