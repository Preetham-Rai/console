package web

import (
	"log"
	"net/http"
)

type Engine struct {
	server *http.Server
	mux    *http.ServeMux
}

func New() *Engine {
	mux := http.NewServeMux()

	router := &Engine{
		mux: mux,
	}

	return router
}

func (e *Engine) Start(addr string) {
	log.Printf("Application is Running in PORT http://localhost%v\n", addr)
	http.ListenAndServe(addr, e.mux)
}

func (e *Engine) Get(path string, handler http.HandlerFunc) {
	e.mux.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
		if req.Method == http.MethodGet {
			handler(res, req)
			return
		}
		http.NotFound(res, req)
	})
}

func (e *Engine) Post(path string, handler http.HandlerFunc) {
	e.mux.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
		if req.Method == http.MethodPost {
			handler(res, req)
			return
		}
		http.NotFound(res, req)
	})
}
func (e *Engine) Put(path string, handler http.HandlerFunc) {
	e.mux.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
		if req.Method == http.MethodPut {
			handler(res, req)
			return
		}
		http.NotFound(res, req)
	})
}
func (e *Engine) Delete(path string, handler http.HandlerFunc) {
	e.mux.HandleFunc(path, func(res http.ResponseWriter, req *http.Request) {
		if req.Method == http.MethodDelete {
			handler(res, req)
			return
		}
		http.NotFound(res, req)
	})
}
