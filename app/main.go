package main

import (
	"github.com/Preetham-Rai/console/app/cmd"
	"github.com/Preetham-Rai/console/app/db"
	"github.com/Preetham-Rai/console/app/pkg/env"
)

func main() {
	env.Init()
	db.Connect()
	cmd.RunServer()
}
