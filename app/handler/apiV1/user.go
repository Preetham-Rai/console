package apiV1

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/Preetham-Rai/console/app/model"
	"github.com/Preetham-Rai/console/app/service"
)

type UserHandler struct {
	service *service.UserService
}

func NewUserHandler(s *service.UserService) *UserHandler {
	return &UserHandler{
		service: s,
	}
}

func (h *UserHandler) CreateUser() http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		var body model.User

		//decode req body
		err := json.NewDecoder(req.Body).Decode(&body)
		if err != nil {
			http.Error(res, "Invalid Request Body", http.StatusBadRequest)
			return
		}
		fmt.Println(body)
		user, err := h.service.RegisterUser(body)
		if err != nil {
			http.Error(res, "Falied to Register User", http.StatusBadRequest)
			return
		}

		res.WriteHeader(http.StatusCreated)
		json.NewEncoder(res).Encode(user)
	}
}
