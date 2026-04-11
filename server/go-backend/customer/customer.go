package customer

import (
	"Server/user"
	"fmt"
)

var Customer *user.User

func CreateCustomer(params *user.User) (*user.User, error) {

	if params.Name == "" {
		return &user.User{}, fmt.Errorf("Failed to create customer")
	}

	Customer = &user.User{
		Name:    params.Name,
		Age:     params.Age,
		IsAdmin: false,
		Role:    "customer",
	}
	return Customer, nil
}
