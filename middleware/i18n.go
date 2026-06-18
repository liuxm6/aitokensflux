package middleware

import (
	"github.com/gin-gonic/gin"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/i18n"
)

// I18n middleware detects and sets the language preference for the request
func I18n() gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := detectLanguage(c)
		c.Set(string(constant.ContextKeyLanguage), lang)
		c.Next()
	}
}

// detectLanguage determines the language preference for the request
// Priority: 1. User setting (if logged in) -> 2. UI language cookie -> 3. edge country header -> 4. Accept-Language header -> 5. Default language
func detectLanguage(c *gin.Context) string {
	// 1. Try to get language from user setting (set by auth middleware)
	if userSetting, ok := common.GetContextKeyType[dto.UserSetting](c, constant.ContextKeyUserSetting); ok {
		if userSetting.Language != "" && i18n.IsSupported(userSetting.Language) {
			return userSetting.Language
		}
	}

	// 2. Try frontend language cookie set by the web entrypoint.
	if cookieLang, err := c.Cookie(common.InterfaceLanguageCookieName); err == nil {
		lang := i18n.ParseAcceptLanguage(cookieLang)
		if i18n.IsSupported(lang) {
			return lang
		}
	}

	// 3. Try edge-provided country header, such as Cloudflare CF-IPCountry.
	if countryLang := common.InterfaceLanguageFromCountryCode(common.EdgeCountryCodeFromHeaders(c.GetHeader)); countryLang != "" {
		lang := i18n.ParseAcceptLanguage(countryLang)
		if i18n.IsSupported(lang) {
			return lang
		}
	}

	// 4. Parse Accept-Language header
	acceptLang := c.GetHeader("Accept-Language")
	if acceptLang != "" {
		lang := i18n.ParseAcceptLanguage(acceptLang)
		if i18n.IsSupported(lang) {
			return lang
		}
	}

	// 5. Return default language
	return i18n.DefaultLang
}

// GetLanguage returns the current language from gin context
func GetLanguage(c *gin.Context) string {
	if lang := c.GetString(string(constant.ContextKeyLanguage)); lang != "" {
		return lang
	}
	return i18n.DefaultLang
}
