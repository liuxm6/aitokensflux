package router

import (
	"os"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

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
