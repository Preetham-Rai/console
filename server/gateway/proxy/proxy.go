package proxy

import (
	"fmt"
	"gateway/config"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"
)

type Router struct {
	routes  []config.RouteConfig
	proxies map[string]*httputil.ReverseProxy
	cfg     *config.Config
	logger  *slog.Logger
}

func New(cfg *config.Config, logger *slog.Logger) (*Router, error) {
	proxies := make(map[string]*httputil.ReverseProxy)

	for _, svc := range cfg.Services {
		targetURl := &url.URL{
			Scheme: "http",
			Host:   fmt.Sprintf("%s:%d", svc.Host, svc.Port),
		}

		timeout := svc.Timeout

		if timeout == 0 {
			timeout = 10 * time.Second
		}

		proxy := httputil.NewSingleHostReverseProxy(targetURl)

		proxy.Transport = &http.Transport{
			ResponseHeaderTimeout: timeout,
		}

		proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
			logger.Error("Proxy Error",
				"service", svc.Name,
				"url", r.URL.String(),
				"error", err.Error(),
			)
			http.Error(w, fmt.Sprintf(`{"error":"upstream service %q unavailable","detail":%q}`, svc.Name, err.Error()),
				http.StatusBadRequest)
		}

		proxy.Director = func(req *http.Request) {
			req.URL.Scheme = targetURl.Scheme
			req.URL.Host = targetURl.Host
			req.Host = targetURl.Host

			if clientIP := req.RemoteAddr; clientIP != "" {
				if prior, ok := req.Header["X-Forwarded-For"]; ok {
					clientIP = strings.Join(prior, ", ") + ", " + clientIP
				}
				req.Header.Set("X-Forwarded-For", clientIP)
			}

			req.Header.Set("X-Forwarded-Host", req.Host)
			req.Header.Set("X-Gateway", "go-api-gateway/1.0")
		}

		proxies[svc.Name] = proxy
		logger.Info("register service", "name", svc.Name, "target", targetURl.String())
	}

	return &Router{
		routes:  cfg.Routes,
		proxies: proxies,
		cfg:     cfg,
		logger:  logger,
	}, nil
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	start := time.Now()

	route := r.matchRoute(req.URL.Path)

	if route == nil {
		r.logger.Warn("no route matched", "path", req.URL.Path, "method", req.Method)
		http.Error(w, `{"error" : "no route found for path"}`, http.StatusNotFound)
	}

	if !r.methodAllowed(route, req.Method) {
		r.logger.Warn("method not allowed",
			"path", req.URL.Path,
			"method", req.Method,
			"allowed", route.Methods,
		)
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	proxy, ok := r.proxies[route.Service]
	if !ok {
		r.logger.Error("proxy not found for service", "service", route.Service)
		http.Error(w, `{"error":"internal gateway error"}`, http.StatusInternalServerError)
		return
	}

	if route.StripPrefix {
		req.URL.Path = strings.TrimPrefix(req.URL.Path, route.Path)
		if req.URL.Path == "" {
			req.URL.Path = "/"
		}
	}

	r.logger.Info("proxying request",
		"method", req.Method,
		"path", req.URL.Path,
		"service", route.Service,
	)

	proxy.ServeHTTP(w, req)

	r.logger.Info("request completed",
		"method", req.Method,
		"path", req.URL.Path,
		"service", route.Service,
		"duration_ms", time.Since(start).Milliseconds(),
	)
}

func (r *Router) matchRoute(path string) *config.RouteConfig {
	var best *config.RouteConfig
	bestlen := -1

	for i := range r.routes {
		route := &r.routes[i]
		if strings.HasPrefix(path, route.Path) {
			if len(route.Path) > bestlen {
				bestlen = len(route.Path)
				best = route
			}
		}
	}

	return best
}

func (r *Router) methodAllowed(route *config.RouteConfig, method string) bool {
	if len(route.Methods) == 0 {
		return true
	}

	for _, m := range route.Methods {
		if strings.EqualFold(m, method) {
			return true
		}
	}

	return false
}
