package env

import (
	"log"

	"github.com/joeshaw/envdecode"
	"github.com/joho/godotenv"
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
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found (this is okay in production)")
	}

	err = envdecode.Decode(&Config)
	if err != nil {
		panic(err)
	}
}
