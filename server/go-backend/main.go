package main

import "fmt"

func printHello() {
	fmt.Println("Hello")
}

func main() {

	// var cu user.User = user.User{
	// 	Name:    "John Doe",
	// 	Age:     21,
	// 	IsAdmin: false,
	// 	Role:    "customer",
	// }

	// u, err := customer.CreateCustomer(&cu)

	// if err != nil {
	// 	fmt.Printf("There was an issue creating customer %v\n", err)
	// 	return
	// }

	go printHello()

	fmt.Println("Main function")

}
