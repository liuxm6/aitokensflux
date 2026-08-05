package types

import (
	"os"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// NewFileSourceFromData routes http/https strings to a URL source and
// everything else (inline data) to a base64 source.
func TestNewFileSourceFromData(t *testing.T) {
	cases := []struct {
		name  string
		data  string
		isURL bool
	}{
		{"http url", "http://example.com/a.png", true},
		{"https url", "https://example.com/a.png", true},
		{"base64 data", "iVBORw0KGgoAAAANSUhEUg==", false},
		{"data uri is not http scheme", "data:image/png;base64,AAAA", false},
		{"empty", "", false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			src := NewFileSourceFromData(tc.data, "image/png")
			assert.Equal(t, tc.isURL, src.IsURL())
			assert.Equal(t, tc.data, src.GetRawData())
		})
	}
}

func TestURLSourceIdentifierTruncation(t *testing.T) {
	short := NewURLFileSource("https://example.com/x")
	assert.Equal(t, "https://example.com/x", short.GetIdentifier())

	long := NewURLFileSource("https://example.com/" + strings.Repeat("a", 200))
	id := long.GetIdentifier()
	assert.True(t, strings.HasSuffix(id, "..."))
	assert.Equal(t, 103, len(id), "100 chars + ellipsis")

	// URL sources never drop their raw data.
	long.ClearRawData()
	assert.NotEmpty(t, long.GetRawData())
}

func TestBase64SourceIdentifierAndClear(t *testing.T) {
	short := NewBase64FileSource("abc", "image/png")
	assert.Equal(t, "base64:abc", short.GetIdentifier())
	assert.False(t, short.IsURL())

	longData := strings.Repeat("Z", 60)
	src := NewBase64FileSource(longData, "image/png")
	id := src.GetIdentifier()
	assert.True(t, strings.HasPrefix(id, "base64:"))
	assert.True(t, strings.HasSuffix(id, "..."))

	// ClearRawData only frees large payloads (> 1024 bytes).
	src.ClearRawData()
	assert.Equal(t, longData, src.GetRawData(), "small base64 payloads are retained")

	big := NewBase64FileSource(strings.Repeat("Z", 2048), "image/png")
	big.ClearRawData()
	assert.Empty(t, big.GetRawData(), "large base64 payloads are freed")
}

func TestBaseFileSourceCacheLifecycle(t *testing.T) {
	src := NewURLFileSource("https://example.com/x")
	assert.False(t, src.HasCache())
	assert.Nil(t, src.GetCache())

	cache := NewMemoryCachedData("payload", "image/png", 7)
	src.SetCache(cache)
	assert.True(t, src.HasCache())
	require.NotNil(t, src.GetCache())

	src.ClearCache()
	assert.False(t, src.HasCache())
	assert.Nil(t, src.GetCache())
}

func TestBaseFileSourceRegisteredFlag(t *testing.T) {
	src := NewBase64FileSource("abc", "image/png")
	assert.False(t, src.IsRegistered())
	src.SetRegistered(true)
	assert.True(t, src.IsRegistered())
	require.NotNil(t, src.Mu())
}

func TestMemoryCachedData(t *testing.T) {
	c := NewMemoryCachedData("hello", "text/plain", 5)
	assert.False(t, c.IsDisk())

	data, err := c.GetBase64Data()
	require.NoError(t, err)
	assert.Equal(t, "hello", data)

	c.SetBase64Data("world")
	data, err = c.GetBase64Data()
	require.NoError(t, err)
	assert.Equal(t, "world", data)

	// Close frees in-memory data without error.
	require.NoError(t, c.Close())
	data, err = c.GetBase64Data()
	require.NoError(t, err)
	assert.Equal(t, "", data)
}

func TestDiskCachedDataClose(t *testing.T) {
	path := t.TempDir() + "/cache.bin"
	require.NoError(t, os.WriteFile(path, []byte("disk-payload"), 0o600))

	c := NewDiskCachedData(path, "application/octet-stream", 12)
	assert.True(t, c.IsDisk())

	data, err := c.GetBase64Data()
	require.NoError(t, err)
	assert.Equal(t, "disk-payload", data)

	// SetBase64Data is a no-op for disk-backed caches.
	c.SetBase64Data("ignored")
	data, err = c.GetBase64Data()
	require.NoError(t, err)
	assert.Equal(t, "disk-payload", data)

	// Close removes the backing file and fires the OnClose accounting hook once.
	closes := 0
	c.OnClose = func(int64) { closes++ }
	require.NoError(t, c.Close())
	assert.Equal(t, 1, closes)

	// A second close is idempotent and does not double-count.
	require.NoError(t, c.Close())
	assert.Equal(t, 1, closes)

	// Reading after close reports the closed cache.
	_, err = c.GetBase64Data()
	assert.Error(t, err)
}
