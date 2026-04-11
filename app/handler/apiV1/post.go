package apiV1

import (
	"net/http"
)

func PostHandler() http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		res.Write([]byte("Hello from PostHandler Function"))
	}
}
