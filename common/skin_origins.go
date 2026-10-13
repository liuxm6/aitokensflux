package common

import (
	"fmt"
	"net/url"
	"os"
	"strings"
)

// SkinOrigins lists allowed browser origins for the external Skin static site (CORS).
// Populated from SKIN_ORIGINS (comma-separated absolute origins, e.g. https://skin.example.com).
var SkinOrigins []string

func InitSkinOrigins() error {
	raw := strings.TrimSpace(os.Getenv("SKIN_ORIGINS"))
	SkinOrigins = nil
	if raw == "" {
		return nil
	}

	for _, part := range strings.Split(raw, ",") {
		origin := strings.TrimSpace(part)
		if origin == "" {
			return fmt.Errorf("SKIN_ORIGINS contains an empty origin")
		}
		parsed, err := url.Parse(origin)
		if err != nil {
			return fmt.Errorf("invalid SKIN_ORIGINS entry %q: %w", origin, err)
		}
		if parsed.Scheme != "http" && parsed.Scheme != "https" {
			return fmt.Errorf("SKIN_ORIGINS entry %q must use http or https", origin)
		}
		if parsed.Host == "" {
			return fmt.Errorf("SKIN_ORIGINS entry %q must include a host", origin)
		}
		if parsed.Path != "" && parsed.Path != "/" {
			return fmt.Errorf("SKIN_ORIGINS entry %q must not include a path", origin)
		}
		if parsed.RawQuery != "" || parsed.Fragment != "" {
			return fmt.Errorf("SKIN_ORIGINS entry %q must not include query or fragment", origin)
		}
		normalized := parsed.Scheme + "://" + parsed.Host
		SkinOrigins = append(SkinOrigins, normalized)
	}
	return nil
}
