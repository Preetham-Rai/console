package repository

import "github.com/Preetham-Rai/console/app/model"

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) GetUserByID(id string) model.User {
	return model.User{
		ID:   id,
		Name: "John Doe",
	}
}
