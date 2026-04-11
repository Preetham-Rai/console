package cmd

import (
	"net/http"

	apiV1 "github.com/Preetham-Rai/console/app/handler/apiV1"
	"github.com/Preetham-Rai/console/app/pkg/web"
)

func routes(r *web.Engine) *web.Engine {

	r.Get("/", func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("Starting Route"))
	})
	r.Get("/post", apiV1.PostHandler())

	return r
}
