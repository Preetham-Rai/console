package service

import (
	"errors"

	"github.com/Preetham-Rai/console/app/model"
	"github.com/Preetham-Rai/console/app/repository"
	"github.com/Preetham-Rai/console/app/service/auth"
)

type UserRegistration struct {
	Name     string `json:"name"`
	Age      int    `json:"age,omitempty"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
	IsAdmin  bool   `json:"isAdmin"`
}

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) RegisterUser(user model.User) (model.User, error) {
	_, ok := s.repo.FindByEmail(user.Email)
	if ok == true {
		return model.User{}, errors.New("user already exists")
	}

	hashed, err := auth.HashPassword(user.Password)
	if err != nil {
		return model.User{}, err
	}

	user = model.User{
		Name:     user.Name,
		Email:    user.Email,
		Password: hashed,
		Role:     user.Role,
		IsAdmin:  user.IsAdmin,
	}

	er := s.repo.Save(user)
	if er != nil {
		return model.User{}, er
	}

	return user, nil
}
