package channel

import (
	"mime/multipart"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCollectImageFormFiles(t *testing.T) {
	header := func(name string) *multipart.FileHeader {
		return &multipart.FileHeader{Filename: name}
	}

	cases := []struct {
		name      string
		files     map[string][]*multipart.FileHeader
		expectErr bool
		expected  []string
	}{
		{name: "no file field", files: nil, expectErr: true},
		{name: "empty image field", files: map[string][]*multipart.FileHeader{"image": {}}, expectErr: true},
		{
			name:     "standard image field",
			files:    map[string][]*multipart.FileHeader{"image": {header("a.png")}},
			expected: []string{"a.png"},
		},
		{
			name:     "array image field",
			files:    map[string][]*multipart.FileHeader{"image[]": {header("a.png"), header("b.png")}},
			expected: []string{"a.png", "b.png"},
		},
		{
			name:     "indexed image fields",
			files:    map[string][]*multipart.FileHeader{"image[0]": {header("a.png")}},
			expected: []string{"a.png"},
		},
		{
			name:      "unrelated field only",
			files:     map[string][]*multipart.FileHeader{"mask": {header("m.png")}},
			expectErr: true,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			files, err := CollectImageFormFiles(&multipart.Form{File: tc.files})
			if tc.expectErr {
				assert.Error(t, err)
				assert.Nil(t, files)
				return
			}
			require.NoError(t, err)
			names := make([]string, 0, len(files))
			for _, f := range files {
				names = append(names, f.Filename)
			}
			assert.ElementsMatch(t, tc.expected, names)
		})
	}
}
