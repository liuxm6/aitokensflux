package router

import "testing"

func TestParseAdminWebHosts(t *testing.T) {
	hosts := parseAdminWebHosts("admin.example.com, https://bad.example.com, ADMIN.EXAMPLE.ORG:443, [::1]:3000")

	if _, ok := hosts["admin.example.com"]; !ok {
		t.Fatal("expected admin.example.com to be allowed")
	}
	if _, ok := hosts["admin.example.org"]; !ok {
		t.Fatal("expected admin.example.org to be allowed")
	}
	if _, ok := hosts["::1"]; !ok {
		t.Fatal("expected IPv6 host to be normalized")
	}
	if _, ok := hosts["https://bad.example.com"]; ok {
		t.Fatal("expected hosts with scheme to be ignored")
	}
}

func TestNormalizeRequestHost(t *testing.T) {
	tests := map[string]string{
		"admin.example.com":      "admin.example.com",
		"ADMIN.EXAMPLE.COM:443":  "admin.example.com",
		"[::1]:3000":             "::1",
		"  admin.example.com  ":  "admin.example.com",
		"https://example.com":    "",
		"admin.example.com:3000": "admin.example.com",
	}

	for input, expected := range tests {
		if actual := normalizeRequestHost(input); actual != expected {
			t.Fatalf("normalizeRequestHost(%q) = %q, expected %q", input, actual, expected)
		}
	}
}
