package db

import (
	"context"
	"fmt"
	"time"

	"github.com/Preetham-Rai/console/app/pkg/env"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func fallbackURL(url string) string {
	if url == "" {
		return "mongodb://localhost:27017"
	}
	return url
}

func Connect() *mongo.Database {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dbName := env.Config.DatabaseName
	dbURI := fallbackURL(env.Config.DatabaseURL) + dbName

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURI))
	if err != nil {
		panic(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		panic(err)
	}

	fmt.Println("Database connection succesfull")
	return client.Database(dbName)
}
