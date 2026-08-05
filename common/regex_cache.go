package common

import (
	"regexp"
	"sync"
)

var compiledRegexCache sync.Map // map[string]*regexp.Regexp

// CompileRegexCached compiles pattern once and reuses it on later calls.
func CompileRegexCached(pattern string) (*regexp.Regexp, error) {
	if cached, ok := compiledRegexCache.Load(pattern); ok {
		return cached.(*regexp.Regexp), nil
	}
	compiled, err := regexp.Compile(pattern)
	if err != nil {
		return nil, err
	}
	compiledRegexCache.Store(pattern, compiled)
	return compiled, nil
}

// MatchAnyRegex reports whether s matches any of the patterns, using the shared
// compiled-regex cache. Invalid patterns are treated as non-matching so runtime
// traffic is not broken by a bad configuration value.
func MatchAnyRegex(patterns []string, s string) bool {
	if len(patterns) == 0 || s == "" {
		return false
	}
	for _, pattern := range patterns {
		if pattern == "" {
			continue
		}
		re, err := CompileRegexCached(pattern)
		if err != nil {
			continue
		}
		if re.MatchString(s) {
			return true
		}
	}
	return false
}
