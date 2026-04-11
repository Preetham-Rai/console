package cmd

import (
	"github.com/Preetham-Rai/console/app/pkg/web"
)

var addr string = ":8080"

func RunServer() {

	e := routes(web.New())
	e.Start(addr)
}
