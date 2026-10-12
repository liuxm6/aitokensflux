package common

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMatchAnyRegex(t *testing.T) {
	cases := []struct {
		name     string
		patterns []string
		input    string
		expected bool
	}{
		{"no patterns", nil, "gpt-4o", false},
		{"empty input", []string{".*"}, "", false},
		{"empty pattern skipped", []string{"", "^gpt-4o$"}, "gpt-4o", true},
		{"anchored miss", []string{"^gpt-4o$"}, "gpt-4o-mini", false},
		{"second pattern matches", []string{"^claude", "^gpt-"}, "gpt-4o", true},
		{"invalid pattern is not a match", []string{"["}, "gpt-4o", false},
		{"invalid pattern does not hide valid one", []string{"[", "^gpt-"}, "gpt-4o", true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.expected, MatchAnyRegex(tc.patterns, tc.input))
			// cached compilation must produce the same verdict
			assert.Equal(t, tc.expected, MatchAnyRegex(tc.patterns, tc.input))
		})
	}
}
