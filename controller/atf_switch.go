package controller

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	atfSwitchProviderName = "Ai Tokens Flux"
	atfSwitchHomepage     = "https://aitokensflux.com"
	atfSwitchEndpoint     = "https://aitokensflux.com"
	atfSwitchV1Endpoint   = "https://aitokensflux.com/v1"
)

type atfSwitchAppInfo struct {
	App       string
	Label     string
	Endpoint  string
	Model     string
	TokenName string
}

var atfSwitchApps = map[string]atfSwitchAppInfo{
	"claude": {
		App:       "claude",
		Label:     "Claude Code",
		Endpoint:  atfSwitchEndpoint,
		Model:     "claude-sonnet-4.6",
		TokenName: "ATF Switch - Claude Code",
	},
	"claude-desktop": {
		App:       "claude-desktop",
		Label:     "Claude Desktop",
		Endpoint:  atfSwitchEndpoint,
		Model:     "claude-sonnet-4.6",
		TokenName: "ATF Switch - Claude Desktop",
	},
	"codex": {
		App:       "codex",
		Label:     "Codex",
		Endpoint:  atfSwitchV1Endpoint,
		Model:     "gpt-5.5",
		TokenName: "ATF Switch - Codex",
	},
	"gemini": {
		App:       "gemini",
		Label:     "Gemini CLI",
		Endpoint:  atfSwitchEndpoint,
		Model:     "gemini-2.5-pro",
		TokenName: "ATF Switch - Gemini CLI",
	},
	"opencode": {
		App:       "opencode",
		Label:     "OpenCode",
		Endpoint:  atfSwitchV1Endpoint,
		Model:     "claude-sonnet-4.6",
		TokenName: "ATF Switch - OpenCode",
	},
	"openclaw": {
		App:       "openclaw",
		Label:     "OpenClaw",
		Endpoint:  atfSwitchV1Endpoint,
		Model:     "claude-sonnet-4.6",
		TokenName: "ATF Switch - OpenClaw",
	},
	"hermes": {
		App:       "hermes",
		Label:     "Hermes",
		Endpoint:  atfSwitchV1Endpoint,
		Model:     "claude-sonnet-4.6",
		TokenName: "ATF Switch - Hermes",
	},
}

func normalizeATFSwitchApp(app string) string {
	normalized := strings.TrimSpace(strings.ToLower(app))
	switch normalized {
	case "claude_desktop", "claudedesktop":
		return "claude-desktop"
	default:
		return normalized
	}
}

func formatATFSwitchAPIKey(key string) string {
	key = strings.TrimSpace(key)
	if strings.HasPrefix(key, "sk-") {
		return key
	}
	return "sk-" + key
}

func atfSwitchEndpointForRequest(c *gin.Context, info atfSwitchAppInfo) string {
	host := strings.TrimSpace(c.GetHeader("X-Forwarded-Host"))
	if host == "" {
		host = strings.TrimSpace(c.Request.Host)
	}
	normalizedHost := strings.ToLower(host)
	if host == "" || strings.Contains(normalizedHost, "aitokensflux.com") {
		return info.Endpoint
	}

	scheme := strings.TrimSpace(c.GetHeader("X-Forwarded-Proto"))
	if scheme == "" {
		if c.Request.TLS != nil {
			scheme = "https"
		} else {
			scheme = "http"
		}
	}

	base := strings.TrimRight(scheme+"://"+host, "/")
	if strings.HasSuffix(info.Endpoint, "/v1") {
		return base + "/v1"
	}
	return base
}

func findATFSwitchToken(userId int, tokenName string) (*model.Token, error) {
	var token model.Token
	err := model.DB.Where("user_id = ? AND name = ?", userId, tokenName).
		Order("id desc").
		First(&token).Error
	if err != nil {
		return nil, err
	}
	return &token, nil
}

func ensureATFSwitchToken(userId int, info atfSwitchAppInfo) (*model.Token, bool, error) {
	now := common.GetTimestamp()
	token, err := findATFSwitchToken(userId, info.TokenName)
	if err == nil {
		changed := false
		accessedChanged := false
		if token.Status != common.TokenStatusEnabled {
			token.Status = common.TokenStatusEnabled
			changed = true
		}
		if token.ExpiredTime != -1 {
			token.ExpiredTime = -1
			changed = true
		}
		if !token.UnlimitedQuota {
			token.UnlimitedQuota = true
			token.RemainQuota = 0
			changed = true
		}
		if token.AccessedTime != now {
			token.AccessedTime = now
			accessedChanged = true
		}
		if changed {
			if err := token.Update(); err != nil {
				return nil, false, err
			}
		}
		if accessedChanged {
			if err := token.SelectUpdate(); err != nil {
				return nil, false, err
			}
		}
		return token, false, nil
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, false, err
	}

	maxTokens := operation_setting.GetMaxUserTokens()
	count, err := model.CountUserTokens(userId)
	if err != nil {
		return nil, false, err
	}
	if int(count) >= maxTokens {
		return nil, false, fmt.Errorf("已达到最大令牌数量限制 (%d)", maxTokens)
	}

	key, err := common.GenerateKey()
	if err != nil {
		return nil, false, err
	}
	token = &model.Token{
		UserId:         userId,
		Name:           info.TokenName,
		Key:            key,
		Status:         common.TokenStatusEnabled,
		CreatedTime:    now,
		AccessedTime:   now,
		ExpiredTime:    -1,
		RemainQuota:    0,
		UnlimitedQuota: true,
	}
	if err := token.Insert(); err != nil {
		return nil, false, err
	}
	return token, true, nil
}

func ensureATFSwitchAccessToken(user *model.User) (string, error) {
	if token := strings.TrimSpace(user.GetAccessToken()); token != "" {
		return token, nil
	}

	for attempts := 0; attempts < 5; attempts++ {
		key, err := common.GenerateRandomKey(32)
		if err != nil {
			return "", err
		}
		var count int64
		if err := model.DB.Model(&model.User{}).Where("access_token = ?", key).Count(&count).Error; err != nil {
			return "", err
		}
		if count > 0 {
			continue
		}

		user.SetAccessToken(key)
		if err := user.Update(false); err != nil {
			return "", err
		}
		return key, nil
	}

	return "", fmt.Errorf("生成 ATF Switch 授权令牌失败，请重试")
}

func buildATFSwitchDeepLink(info atfSwitchAppInfo, endpoint string, userId int, apiKey string, accessToken string, accountEmail string) string {
	params := url.Values{}
	params.Set("resource", "provider")
	params.Set("app", info.App)
	params.Set("name", atfSwitchProviderName)
	params.Set("homepage", atfSwitchHomepage)
	params.Set("endpoint", endpoint)
	params.Set("apiKey", apiKey)
	params.Set("model", info.Model)
	params.Set("notes", "浏览器授权 · "+info.Model)
	params.Set("icon", "atf")
	params.Set("enabled", "true")
	params.Set("usageEnabled", "true")
	params.Set("usageApiKey", apiKey)
	params.Set("usageBaseUrl", endpoint)
	params.Set("usageAccessToken", accessToken)
	params.Set("usageUserId", strconv.Itoa(userId))
	if accountEmail != "" {
		params.Set("usageAccountEmail", accountEmail)
	}
	params.Set("usageAutoInterval", "5")
	params.Set("usageTemplateType", "newapi")
	return "atfswitch://v1/import?" + params.Encode()
}

func ConnectATFSwitch(c *gin.Context) {
	app := normalizeATFSwitchApp(c.Query("app"))
	info, ok := atfSwitchApps[app]
	if !ok {
		common.ApiErrorMsg(c, "不支持的 ATF Switch 应用类型")
		return
	}

	userId := c.GetInt("id")
	user, err := model.GetUserById(userId, true)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	accountEmail := strings.TrimSpace(user.Email)
	accessToken, err := ensureATFSwitchAccessToken(user)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	token, created, err := ensureATFSwitchToken(userId, info)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	endpoint := atfSwitchEndpointForRequest(c, info)
	apiKey := formatATFSwitchAPIKey(token.GetFullKey())
	common.ApiSuccess(c, gin.H{
		"app":           info.App,
		"label":         info.Label,
		"name":          atfSwitchProviderName,
		"endpoint":      endpoint,
		"model":         info.Model,
		"token_id":      token.Id,
		"token_name":    token.Name,
		"created":       created,
		"api_key":       apiKey,
		"access_token":  accessToken,
		"accessToken":   accessToken,
		"user_id":       strconv.Itoa(userId),
		"email":         accountEmail,
		"accountEmail":  accountEmail,
		"account_email": accountEmail,
		"userEmail":     accountEmail,
		"user_email":    accountEmail,
		"username":      user.Username,
		"displayName":   user.DisplayName,
		"display_name":  user.DisplayName,
		"deep_link":     buildATFSwitchDeepLink(info, endpoint, userId, apiKey, accessToken, accountEmail),
	})
}
