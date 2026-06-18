package common

import "testing"

func TestInterfaceLanguageFromCountryCode(t *testing.T) {
	tests := map[string]string{
		"CN": "zh",
		"tw": "zh-TW",
		"HK": "zh-TW",
		"FR": "fr",
		"JP": "ja",
		"RU": "ru",
		"VN": "vi",
		"US": "en",
		"DE": "en",
		"XX": "",
		"T1": "",
		"":   "",
	}

	for input, expected := range tests {
		if actual := InterfaceLanguageFromCountryCode(input); actual != expected {
			t.Fatalf("InterfaceLanguageFromCountryCode(%q) = %q, expected %q", input, actual, expected)
		}
	}
}

func TestNormalizeInterfaceLanguage(t *testing.T) {
	tests := map[string]string{
		"zh-CN":   "zh",
		"zh_TW":   "zh-TW",
		"zh-Hant": "zh-TW",
		"en-US":   "en",
		"fr-FR":   "fr",
		"ja-JP":   "ja",
		"ru-RU":   "ru",
		"vi-VN":   "vi",
		"de-DE":   "",
		"":        "",
	}

	for input, expected := range tests {
		if actual := NormalizeInterfaceLanguage(input); actual != expected {
			t.Fatalf("NormalizeInterfaceLanguage(%q) = %q, expected %q", input, actual, expected)
		}
	}
}

func TestEdgeCountryCodeFromHeaders(t *testing.T) {
	headers := map[string]string{
		"CF-IPCountry":               "",
		"X-Vercel-IP-Country":        "jp",
		"CloudFront-Viewer-Country":  "CN",
		"X-Country-Code":             "FR",
		"X-Geo-Country":              "VN",
		"X-Custom-Viewer-Country":    "RU",
		"X-Invalid-Viewer-Country":   "INVALID",
		"X-Unknown-Viewer-Country":   "XX",
		"X-Anonymous-Viewer-Country": "T1",
	}

	actual := EdgeCountryCodeFromHeaders(func(header string) string {
		return headers[header]
	})

	if actual != "JP" {
		t.Fatalf("EdgeCountryCodeFromHeaders() = %q, expected %q", actual, "JP")
	}
}

func TestEdgeCountryHeaderNamesCustomHeaderFirst(t *testing.T) {
	t.Setenv("GEOIP_COUNTRY_HEADER", "X-Custom-Viewer-Country")

	headers := EdgeCountryHeaderNames()
	if len(headers) == 0 || headers[0] != "X-Custom-Viewer-Country" {
		t.Fatalf("expected custom header to be first, got %#v", headers)
	}
}
