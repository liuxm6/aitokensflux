package types

import (
	"sort"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSet(t *testing.T) {
	s := NewSet[string]()
	assert.Equal(t, 0, s.Len())
	assert.False(t, s.Contains("a"))

	s.Add("a")
	s.Add("b")
	s.Add("a") // duplicate is a no-op
	assert.Equal(t, 2, s.Len())
	assert.True(t, s.Contains("a"))

	items := s.Items()
	sort.Strings(items)
	assert.Equal(t, []string{"a", "b"}, items)

	s.Remove("a")
	assert.False(t, s.Contains("a"))
	assert.Equal(t, 1, s.Len())

	// Removing a missing element is a no-op.
	s.Remove("missing")
	assert.Equal(t, 1, s.Len())
}

func TestRWMapBasicOps(t *testing.T) {
	m := NewRWMap[string, int]()
	assert.Equal(t, 0, m.Len())

	_, ok := m.Get("x")
	assert.False(t, ok)

	m.Set("x", 1)
	v, ok := m.Get("x")
	assert.True(t, ok)
	assert.Equal(t, 1, v)

	m.AddAll(map[string]int{"y": 2, "z": 3})
	assert.Equal(t, 3, m.Len())

	// ReadAll returns a defensive copy.
	all := m.ReadAll()
	all["x"] = 999
	v, _ = m.Get("x")
	assert.Equal(t, 1, v, "mutating ReadAll result must not affect the map")

	m.Clear()
	assert.Equal(t, 0, m.Len())
}

func TestRWMapJSONRoundTrip(t *testing.T) {
	m := NewRWMap[string, int]()
	require.NoError(t, LoadFromJsonString(m, `{"a":1,"b":2}`))
	assert.Equal(t, 2, m.Len())
	v, ok := m.Get("a")
	assert.True(t, ok)
	assert.Equal(t, 1, v)

	out := m.MarshalJSONString()
	// Re-load into a fresh map to compare content independent of key order.
	m2 := NewRWMap[string, int]()
	require.NoError(t, LoadFromJsonString(m2, out))
	assert.Equal(t, m.ReadAll(), m2.ReadAll())
}

func TestLoadFromJsonStringInvalid(t *testing.T) {
	m := NewRWMap[string, int]()
	assert.Error(t, LoadFromJsonString(m, `{not valid json`))
}

func TestLoadFromJsonStringWithCallback(t *testing.T) {
	m := NewRWMap[string, int]()

	called := false
	require.NoError(t, LoadFromJsonStringWithCallback(m, `{"a":1}`, func() { called = true }))
	assert.True(t, called, "callback must fire on successful load")

	// Callback must NOT fire when unmarshal fails.
	called = false
	assert.Error(t, LoadFromJsonStringWithCallback(m, `{bad`, func() { called = true }))
	assert.False(t, called)
}
