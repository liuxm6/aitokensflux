package channel

import (
	"errors"
	"mime/multipart"
	"strings"
)

// CollectImageFormFiles returns the uploaded images of an OpenAI-style image
// edit form. Clients send them as "image", as "image[]" or as indexed
// "image[n]" fields, so all three conventions are accepted.
func CollectImageFormFiles(form *multipart.Form) ([]*multipart.FileHeader, error) {
	if form == nil || form.File == nil {
		return nil, errors.New("image is required")
	}

	if files, ok := form.File["image"]; ok && len(files) > 0 {
		return files, nil
	}
	if files, ok := form.File["image[]"]; ok && len(files) > 0 {
		return files, nil
	}

	var imageFiles []*multipart.FileHeader
	for fieldName, files := range form.File {
		if strings.HasPrefix(fieldName, "image[") && len(files) > 0 {
			imageFiles = append(imageFiles, files...)
		}
	}
	if len(imageFiles) == 0 {
		return nil, errors.New("image is required")
	}
	return imageFiles, nil
}
