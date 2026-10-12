package service

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/google/uuid"
)

// callCodexWhamAPI validates the ChatGPT credentials, calls path on baseURL and
// returns the upstream status code together with the raw response body.
// A non-nil requestBody is sent as JSON.
func callCodexWhamAPI(
	ctx context.Context,
	client *http.Client,
	baseURL string,
	accessToken string,
	accountID string,
	method string,
	path string,
	requestBody []byte,
) (statusCode int, body []byte, err error) {
	if client == nil {
		return 0, nil, fmt.Errorf("nil http client")
	}
	bu := strings.TrimRight(strings.TrimSpace(baseURL), "/")
	if bu == "" {
		return 0, nil, fmt.Errorf("empty baseURL")
	}
	at := strings.TrimSpace(accessToken)
	aid := strings.TrimSpace(accountID)
	if at == "" {
		return 0, nil, fmt.Errorf("empty accessToken")
	}
	if aid == "" {
		return 0, nil, fmt.Errorf("empty accountID")
	}

	var payload io.Reader
	if requestBody != nil {
		payload = bytes.NewReader(requestBody)
	}
	req, err := http.NewRequestWithContext(ctx, method, bu+path, payload)
	if err != nil {
		return 0, nil, err
	}
	setCodexWhamRequestHeaders(req, at, aid)
	if requestBody != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := client.Do(req)
	if err != nil {
		return 0, nil, err
	}
	defer resp.Body.Close()

	body, err = io.ReadAll(resp.Body)
	if err != nil {
		return resp.StatusCode, nil, err
	}
	return resp.StatusCode, body, nil
}

func FetchCodexWhamUsage(
	ctx context.Context,
	client *http.Client,
	baseURL string,
	accessToken string,
	accountID string,
) (statusCode int, body []byte, err error) {
	return callCodexWhamAPI(ctx, client, baseURL, accessToken, accountID,
		http.MethodGet, "/backend-api/wham/usage", nil)
}

func FetchCodexWhamRateLimitResetCredits(
	ctx context.Context,
	client *http.Client,
	baseURL string,
	accessToken string,
	accountID string,
) (statusCode int, body []byte, err error) {
	return callCodexWhamAPI(ctx, client, baseURL, accessToken, accountID,
		http.MethodGet, "/backend-api/wham/rate-limit-reset-credits", nil)
}

func ConsumeCodexWhamRateLimitResetCredit(
	ctx context.Context,
	client *http.Client,
	baseURL string,
	accessToken string,
	accountID string,
) (statusCode int, body []byte, err error) {
	requestBody, err := common.Marshal(map[string]string{
		"redeem_request_id": uuid.NewString(),
	})
	if err != nil {
		return 0, nil, err
	}
	return callCodexWhamAPI(ctx, client, baseURL, accessToken, accountID,
		http.MethodPost, "/backend-api/wham/rate-limit-reset-credits/consume", requestBody)
}

func setCodexWhamRequestHeaders(req *http.Request, accessToken string, accountID string) {
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("chatgpt-account-id", accountID)
	req.Header.Set("Accept", "application/json")
	if req.Header.Get("originator") == "" {
		req.Header.Set("originator", "codex_cli_rs")
	}
}
