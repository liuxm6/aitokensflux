package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func performStaleSessionAuthRequest(t *testing.T, handler gin.HandlerFunc, user *model.UserBase) *httptest.ResponseRecorder {
	t.Helper()

	previousLoader := loadUserAuthCache
	loadUserAuthCache = func(id int) (*model.UserBase, error) {
		require.Equal(t, 1, id)
		return user, nil
	}
	t.Cleanup(func() {
		loadUserAuthCache = previousLoader
	})

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(sessions.Sessions("session", cookie.NewStore([]byte("auth-test"))))
	router.GET("/login", func(c *gin.Context) {
		session := sessions.Default(c)
		session.Set("username", "stale-admin")
		session.Set("role", common.RoleAdminUser)
		session.Set("id", 1)
		session.Set("status", common.UserStatusEnabled)
		session.Set("group", "default")
		if err := session.Save(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
			return
		}
		c.Status(http.StatusNoContent)
	})
	router.POST("/api/test", handler, func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"success": true})
	})

	loginRecorder := httptest.NewRecorder()
	loginRequest := httptest.NewRequest(http.MethodGet, "/login", nil)
	router.ServeHTTP(loginRecorder, loginRequest)
	require.Equal(t, http.StatusNoContent, loginRecorder.Code)

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/api/test", nil)
	request.Header.Set("New-Api-User", "1")
	for _, sessionCookie := range loginRecorder.Result().Cookies() {
		request.AddCookie(sessionCookie)
	}
	router.ServeHTTP(recorder, request)
	return recorder
}

func TestUserAuthRejectsDisabledUserAfterSessionCreated(t *testing.T) {
	recorder := performStaleSessionAuthRequest(t, UserAuth(), &model.UserBase{
		Id:       1,
		Role:     common.RoleCommonUser,
		Group:    "default",
		Status:   common.UserStatusDisabled,
		Username: "disabled-user",
	})

	require.Equal(t, http.StatusOK, recorder.Code)
	require.Contains(t, recorder.Body.String(), `"success":false`)
	require.NotContains(t, recorder.Body.String(), `"success":true`)
}

func TestAdminAuthRefreshesRoleBeforePrivilegeCheck(t *testing.T) {
	recorder := performStaleSessionAuthRequest(t, AdminAuth(), &model.UserBase{
		Id:       1,
		Role:     common.RoleCommonUser,
		Group:    "default",
		Status:   common.UserStatusEnabled,
		Username: "demoted-user",
	})

	require.Equal(t, http.StatusOK, recorder.Code)
	require.Contains(t, recorder.Body.String(), `"success":false`)
	require.True(t, strings.Contains(recorder.Body.String(), "权限") || strings.Contains(recorder.Body.String(), "privilege"))
}
