package validation

import (
	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func Validate(i interface{}) error {
	return validate.Struct(i)
}
