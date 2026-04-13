package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id"            json:"id"`
	Name      string             `bson:"name"           json:"name"`
	Age       int                `bson:"age,omitempty"  json:"age,omitempty"`
	Email     string             `bson:"email"          json:"email"`
	Password  string             `bson:"password"       json:"-"`
	Role      string             `bson:"role"           json:"role"`
	IsAdmin   bool               `bson:"isAdmin"        json:"isAdmin"`
	CreatedAt time.Time          `bson:"createdAt"      json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt"      json:"updatedAt"`
}
