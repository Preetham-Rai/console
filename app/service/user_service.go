package service

import (
	"github.com/Preetham-Rai/console/app/model"
	"github.com/Preetham-Rai/console/app/repository"
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) GetUser(id string) model.User {
	return s.repo.GetUserByID(id)
}
