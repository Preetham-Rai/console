package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {

	port := ":8080"

	fmt.Printf("This is the go server")

	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		fmt.Fprintf(w, "Welcome to golang server")
	})

	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Server Failed due to an error", err)
	}
}
