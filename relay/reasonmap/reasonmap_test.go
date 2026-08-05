package reasonmap

import (
	"testing"

	"github.com/QuantumNous/new-api/constant"

	"github.com/stretchr/testify/assert"
)

// ClaudeStopReasonToOpenAIFinishReason maps Anthropic stop reasons onto the
// OpenAI finish_reason vocabulary. Matching is case-insensitive and unknown
// reasons pass through unchanged.
func TestClaudeStopReasonToOpenAIFinishReason(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"stop_sequence", "stop"},
		{"end_turn", "stop"},
		{"max_tokens", "length"},
		{"tool_use", "tool_calls"},
		{"refusal", constant.FinishReasonContentFilter},
		{"END_TURN", "stop"}, // case-insensitive
		{"something_else", "something_else"},
		{"", ""},
	}
	for _, tc := range cases {
		t.Run(tc.in, func(t *testing.T) {
			assert.Equal(t, tc.want, ClaudeStopReasonToOpenAIFinishReason(tc.in))
		})
	}
}

// OpenAIFinishReasonToClaudeStopReason is the reverse translation.
func TestOpenAIFinishReasonToClaudeStopReason(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"stop", "end_turn"},
		{"stop_sequence", "stop_sequence"},
		{"length", "max_tokens"},
		{"max_tokens", "max_tokens"},
		{constant.FinishReasonContentFilter, "refusal"},
		{"tool_calls", "tool_use"},
		{"STOP", "end_turn"}, // case-insensitive
		{"unknown", "unknown"},
		{"", ""},
	}
	for _, tc := range cases {
		t.Run(tc.in, func(t *testing.T) {
			assert.Equal(t, tc.want, OpenAIFinishReasonToClaudeStopReason(tc.in))
		})
	}
}

// The canonical finish reasons survive a round trip through both mappings.
func TestFinishReasonRoundTrip(t *testing.T) {
	for _, openai := range []string{"stop", "length", "tool_calls", constant.FinishReasonContentFilter} {
		claude := OpenAIFinishReasonToClaudeStopReason(openai)
		assert.Equal(t, openai, ClaudeStopReasonToOpenAIFinishReason(claude), "round trip for %q", openai)
	}
}
