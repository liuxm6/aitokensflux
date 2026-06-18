package common

import (
	"os"
	"strings"
)

const (
	InterfaceLanguageCookieName   = "i18next"
	InterfaceLanguageCookieMaxAge = 60 * 60 * 24 * 30
)

var defaultEdgeCountryHeaders = []string{
	"CF-IPCountry",
	"X-Vercel-IP-Country",
	"CloudFront-Viewer-Country",
	"X-Country-Code",
	"X-Geo-Country",
}

var countryInterfaceLanguages = map[string]string{
	"CN": "zh",
	"HK": "zh-TW",
	"MO": "zh-TW",
	"TW": "zh-TW",

	"BL": "fr",
	"FR": "fr",
	"GF": "fr",
	"GP": "fr",
	"MC": "fr",
	"MF": "fr",
	"MQ": "fr",
	"NC": "fr",
	"PF": "fr",
	"PM": "fr",
	"RE": "fr",
	"WF": "fr",
	"YT": "fr",

	"JP": "ja",
	"RU": "ru",
	"VN": "vi",
}

func EdgeCountryHeaderNames() []string {
	headers := make([]string, 0, len(defaultEdgeCountryHeaders)+1)
	seen := map[string]struct{}{}

	addHeader := func(header string) {
		header = strings.TrimSpace(header)
		if header == "" {
			return
		}
		key := strings.ToLower(header)
		if _, ok := seen[key]; ok {
			return
		}
		seen[key] = struct{}{}
		headers = append(headers, header)
	}

	addHeader(os.Getenv("GEOIP_COUNTRY_HEADER"))
	for _, header := range defaultEdgeCountryHeaders {
		addHeader(header)
	}
	return headers
}

func EdgeCountryCodeFromHeaders(getHeader func(string) string) string {
	if getHeader == nil {
		return ""
	}
	for _, header := range EdgeCountryHeaderNames() {
		if country := normalizeCountryCode(getHeader(header)); country != "" {
			return country
		}
	}
	return ""
}

func InterfaceLanguageFromCountryCode(country string) string {
	country = normalizeCountryCode(country)
	if country == "" {
		return ""
	}
	if lang, ok := countryInterfaceLanguages[country]; ok {
		return lang
	}
	return "en"
}

func NormalizeInterfaceLanguage(value string) string {
	normalized := strings.ToLower(strings.TrimSpace(strings.ReplaceAll(value, "_", "-")))
	switch {
	case normalized == "zh-tw" || strings.HasPrefix(normalized, "zh-hant"):
		return "zh-TW"
	case normalized == "zh" || strings.HasPrefix(normalized, "zh-"):
		return "zh"
	case normalized == "en" || strings.HasPrefix(normalized, "en-"):
		return "en"
	case normalized == "fr" || strings.HasPrefix(normalized, "fr-"):
		return "fr"
	case normalized == "ja" || strings.HasPrefix(normalized, "ja-"):
		return "ja"
	case normalized == "ru" || strings.HasPrefix(normalized, "ru-"):
		return "ru"
	case normalized == "vi" || strings.HasPrefix(normalized, "vi-"):
		return "vi"
	default:
		return ""
	}
}

func normalizeCountryCode(country string) string {
	country = strings.ToUpper(strings.TrimSpace(country))
	if idx := strings.IndexAny(country, ",;"); idx > -1 {
		country = strings.TrimSpace(country[:idx])
	}
	switch country {
	case "", "XX", "T1", "A1", "A2", "O1":
		return ""
	}
	if len(country) != 2 {
		return ""
	}
	for _, char := range country {
		if char < 'A' || char > 'Z' {
			return ""
		}
	}
	return country
}
