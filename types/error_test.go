package types

import (
	"errors"
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// All accessors must be nil-safe: a nil *NewAPIError is a valid "no error"
// value that callers compare against, so these must never panic.
func TestNewAPIErrorNilSafety(t *testing.T) {
	var e *NewAPIError
	assert.Equal(t, "", e.Error())
	assert.Equal(t, "", e.ErrorWithStatusCode())
	assert.Equal(t, "", e.MaskSensitiveError())
	assert.Equal(t, "", e.MaskSensitiveErrorWithStatusCode())
	assert.Equal(t, ErrorCode(""), e.GetErrorCode())
	assert.Equal(t, ErrorType(""), e.GetErrorType())
	assert.Nil(t, e.Unwrap())
	assert.False(t, IsChannelError(e))
	assert.False(t, IsSkipRetryError(e))
	// A nil error is "no error", so there is nothing to record.
	assert.False(t, IsRecordErrorLog(e))
}

func TestNewErrorDefaults(t *testing.T) {
	e := NewError(errors.New("boom"), ErrorCodeModelPriceError)
	require.NotNil(t, e)
	assert.Equal(t, "boom", e.Error())
	assert.Equal(t, ErrorCodeModelPriceError, e.GetErrorCode())
	assert.Equal(t, ErrorTypeNewAPIError, e.GetErrorType())
	assert.Equal(t, http.StatusInternalServerError, e.StatusCode)
}

// NewError must preserve a NewAPIError wrapped deeper in the chain instead of
// re-wrapping it, while still applying any options passed at the outer layer.
func TestNewErrorPreservesWrappedNewAPIError(t *testing.T) {
	inner := NewErrorWithStatusCode(errors.New("inner"), ErrorCodeInvalidRequest, http.StatusBadRequest)
	wrapped := fmt.Errorf("context: %w", inner)

	out := NewError(wrapped, ErrorCodeModelPriceError, ErrOptionWithSkipRetry())

	assert.Same(t, inner, out, "should return the same underlying NewAPIError instance")
	// Original error code is preserved, not overwritten by the outer call.
	assert.Equal(t, ErrorCodeInvalidRequest, out.GetErrorCode())
	assert.Equal(t, http.StatusBadRequest, out.StatusCode)
	// The option from the outer call is still applied.
	assert.True(t, IsSkipRetryError(out))
}

func TestErrorFallbackToCode(t *testing.T) {
	// When there is no underlying error, Error() falls back to the code string.
	e := &NewAPIError{errorCode: ErrorCodeEmptyResponse}
	assert.Equal(t, string(ErrorCodeEmptyResponse), e.Error())
}

func TestErrorWithStatusCode(t *testing.T) {
	e := NewErrorWithStatusCode(errors.New("bad thing"), ErrorCodeBadResponse, http.StatusBadGateway)
	assert.Equal(t, "status_code=502, bad thing", e.ErrorWithStatusCode())

	// Zero status code omits the prefix.
	noStatus := &NewAPIError{Err: errors.New("plain")}
	assert.Equal(t, "plain", noStatus.ErrorWithStatusCode())

	// Empty message but non-zero status still reports the status.
	emptyMsg := &NewAPIError{StatusCode: 500}
	assert.Equal(t, "status_code=500", emptyMsg.ErrorWithStatusCode())
}

func TestSetMessageAndUnwrap(t *testing.T) {
	sentinel := errors.New("sentinel")
	e := NewError(sentinel, ErrorCodeInvalidRequest)
	assert.ErrorIs(t, e, sentinel, "Unwrap should expose the underlying error to errors.Is")

	e.SetMessage("replaced")
	assert.Equal(t, "replaced", e.Error())
	assert.NotErrorIs(t, e, sentinel, "SetMessage replaces the underlying error")
}

// IsChannelError keys off the "channel:" prefix of the error code.
func TestIsChannelError(t *testing.T) {
	channelErr := NewError(errors.New("x"), ErrorCodeChannelInvalidKey)
	assert.True(t, IsChannelError(channelErr))

	nonChannel := NewError(errors.New("x"), ErrorCodeInvalidRequest)
	assert.False(t, IsChannelError(nonChannel))
}

func TestErrorOptions(t *testing.T) {
	e := NewError(errors.New("x"), ErrorCodeInvalidRequest,
		ErrOptionWithStatusCode(http.StatusTeapot),
		ErrOptionWithSkipRetry(),
		ErrOptionWithNoRecordErrorLog(),
	)
	assert.Equal(t, http.StatusTeapot, e.StatusCode)
	assert.True(t, IsSkipRetryError(e))
	assert.False(t, IsRecordErrorLog(e))
}

func TestIsRecordErrorLogDefaultsTrue(t *testing.T) {
	// Not setting the option leaves the pointer nil, which defaults to true.
	e := NewError(errors.New("x"), ErrorCodeInvalidRequest)
	assert.True(t, IsRecordErrorLog(e))
}

// WithOpenAIError coerces the code, defaults the type, and folds OpenRouter
// metadata into the message.
func TestWithOpenAIError(t *testing.T) {
	t.Run("string code and empty type default", func(t *testing.T) {
		e := WithOpenAIError(OpenAIError{Message: "oops", Code: "rate_limit"}, http.StatusTooManyRequests)
		assert.Equal(t, ErrorCode("rate_limit"), e.GetErrorCode())
		assert.Equal(t, ErrorTypeOpenAIError, e.GetErrorType())
		assert.Equal(t, http.StatusTooManyRequests, e.StatusCode)
		oa := e.ToOpenAIError()
		assert.Equal(t, "upstream_error", oa.Type, "empty type defaults to upstream_error")
	})

	t.Run("non-string code is stringified", func(t *testing.T) {
		e := WithOpenAIError(OpenAIError{Message: "oops", Code: 429}, http.StatusTooManyRequests)
		assert.Equal(t, ErrorCode("429"), e.GetErrorCode())
	})

	t.Run("nil code becomes unknown_error", func(t *testing.T) {
		e := WithOpenAIError(OpenAIError{Message: "oops"}, http.StatusBadGateway)
		assert.Equal(t, ErrorCode("unknown_error"), e.GetErrorCode())
	})

	t.Run("metadata is folded into the message", func(t *testing.T) {
		e := WithOpenAIError(OpenAIError{Message: "oops", Code: "x", Metadata: []byte(`{"reason":"y"}`)}, http.StatusBadGateway)
		assert.Contains(t, e.Error(), "oops")
		assert.Contains(t, e.Error(), `{"reason":"y"}`)
		assert.NotEmpty(t, e.Metadata)
	})
}

func TestWithClaudeError(t *testing.T) {
	e := WithClaudeError(ClaudeError{Message: "denied"}, http.StatusForbidden)
	assert.Equal(t, ErrorTypeClaudeError, e.GetErrorType())
	// Empty claude type defaults to upstream_error and becomes the error code.
	assert.Equal(t, ErrorCode("upstream_error"), e.GetErrorCode())
	assert.Equal(t, http.StatusForbidden, e.StatusCode)
}

// ToOpenAIError / ToClaudeError round-trip and cross-convert between provider
// error shapes. Messages here contain no URLs/IPs so masking is a no-op.
func TestErrorConversions(t *testing.T) {
	t.Run("openai passthrough", func(t *testing.T) {
		e := WithOpenAIError(OpenAIError{Message: "quota exceeded", Type: "insufficient_quota", Code: "insufficient_quota"}, http.StatusForbidden)
		oa := e.ToOpenAIError()
		assert.Equal(t, "quota exceeded", oa.Message)
		assert.Equal(t, "insufficient_quota", oa.Type)
	})

	t.Run("openai to claude", func(t *testing.T) {
		e := WithOpenAIError(OpenAIError{Message: "quota exceeded", Code: "insufficient_quota"}, http.StatusForbidden)
		ce := e.ToClaudeError()
		assert.Equal(t, "quota exceeded", ce.Message)
		assert.Equal(t, "insufficient_quota", ce.Type)
	})

	t.Run("claude to openai", func(t *testing.T) {
		e := WithClaudeError(ClaudeError{Message: "overloaded", Type: "overloaded_error"}, http.StatusServiceUnavailable)
		oa := e.ToOpenAIError()
		assert.Equal(t, "overloaded", oa.Message)
		assert.Equal(t, "overloaded_error", oa.Type)
	})

	t.Run("empty message falls back to error type", func(t *testing.T) {
		e := WithOpenAIError(OpenAIError{Type: "insufficient_quota", Code: "x"}, http.StatusForbidden)
		oa := e.ToOpenAIError()
		assert.Equal(t, string(ErrorTypeOpenAIError), oa.Message)
	})
}
