package cmd

import (
	"fmt"
	"net/http"

	"github.com/Preetham-Rai/console/app/db"
	apiV1 "github.com/Preetham-Rai/console/app/handler/apiV1"
	"github.com/Preetham-Rai/console/app/pkg/web"
	"github.com/Preetham-Rai/console/app/repository"
	"github.com/Preetham-Rai/console/app/service"
)

func routes(r *web.Engine) *web.Engine {

	database := db.Connect()
	userRepo := repository.NewUserRepository(database)
	userService := service.NewUserService(userRepo)
	userHandler := apiV1.NewUserHandler(userService)

	r.Get("/", func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("Starting Route"))
	})
	fmt.Println("Reached Routes")
	r.Get("/post", apiV1.PostHandler())
	r.Post("/user", userHandler.CreateUser())

	return r
}
