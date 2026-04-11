package env

import (
	"github.com/joeshaw/envdecode"
)

type config struct {
	Environment  string `env:"GO_ENV,default=production"`
	Port         string `env:"PORT,default=3000"`
	BaseURL      string `env:"BASE_URL"`
	DatabaseURL  string `env:"DATABASE_URL"`
	DatabaseName string `env:"DATABASE_NAME"`
}

var Config config

func Init() {
	err := envdecode.Decode(&Config)
	if err != nil {
		panic(error.Error(err))
	}
}
