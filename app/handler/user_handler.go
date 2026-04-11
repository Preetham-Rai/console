package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Preetham-Rai/console/app/service"
)

type UserHandler struct {
	service *service.UserService
}

func NewUserHandler(service *service.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) GetUser(w http.ResponseWriter, req *http.Request) {
	parts := strings.Split(req.URL.Path, "/")

	if len(parts) < 3 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	id := parts[len(parts)-1]

	user := h.service.GetUser(id)

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(user)
}
