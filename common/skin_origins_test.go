package common

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestInitSkinOriginsEmpty(t *testing.T) {
	t.Setenv("SKIN_ORIGINS", "")
	require.NoError(t, InitSkinOrigins())
	assert.Empty(t, SkinOrigins)
}

func TestInitSkinOriginsParsesList(t *testing.T) {
	t.Setenv("SKIN_ORIGINS", "https://skin.example.com, http://localhost:5173")
	require.NoError(t, InitSkinOrigins())
	assert.Equal(t, []string{"https://skin.example.com", "http://localhost:5173"}, SkinOrigins)
}

func TestInitSkinOriginsRejectsPath(t *testing.T) {
	t.Setenv("SKIN_ORIGINS", "https://skin.example.com/app")
	require.Error(t, InitSkinOrigins())
}
