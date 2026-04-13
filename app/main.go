package main

import (
	"github.com/Preetham-Rai/console/app/cmd"
	"github.com/Preetham-Rai/console/app/pkg/env"
)

func main() {
	env.Init()
	cmd.RunServer()
}
