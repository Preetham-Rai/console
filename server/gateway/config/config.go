package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server   ServerConfig    `yaml:"server"`
	Logging  LoggingConfig   `yaml:"logging"`
	Services []ServiceConfig `yaml:"services"`
	Routes   []RouteConfig   `yaml:"routes"`
}

type ServerConfig struct {
	Host         string        `yaml:"host"`
	Port         int           `yaml:"port"`
	ReadTimeout  time.Duration `yaml:"read_timeout"`
	WriteTimeout time.Duration `yaml:"write_timeout"`
}

type LoggingConfig struct {
	Level  string `yaml:"level"`
	Format string `yaml:"format"`
}

type ServiceConfig struct {
	Name        string        `yaml:"name"`
	Host        string        `yaml:"host"`
	Port        int           `yaml:"port"`
	HealthCheck string        `yaml:"health_check"`
	Timeout     time.Duration `yaml:"timeout"`
}

type RouteConfig struct {
	Path        string   `yaml:"path"`
	Service     string   `yaml:"service"`
	Methods     []string `yaml:"methods"`
	StripPrefix bool     `yaml:"strip_prefix"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("Failed to read config file %q: %w", path, err)
	}

	var cfg Config

	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("Failed to parse config file %q: %w", path, err)
	}

	if err := cfg.validates(); err != nil {
		return nil, fmt.Errorf("invalid config %q", err)
	}

	return &cfg, nil
}

func (c *Config) validates() error {
	if c.Server.Port == 0 {
		return fmt.Errorf("Server port must be set")
	}

	if len(c.Services) == 0 {
		return fmt.Errorf("Atleat one service must be defined")
	}

	if len(c.Routes) == 0 {
		return fmt.Errorf("Atleast one routes must be defined")
	}

	serviceNames := make(map[string]bool)
	for _, svc := range c.Services {
		if svc.Name == "" {
			return fmt.Errorf("all services must have a name")
		}

		if svc.Port == 0 {
			return fmt.Errorf("Service %q must have a port", svc.Name)
		}

		serviceNames[svc.Name] = true
	}

	for _, r := range c.Routes {
		if r.Path == "" {
			return fmt.Errorf("All routes must have a path")
		}

		if !serviceNames[r.Service] {
			return fmt.Errorf("route %q references unknown service %q", r.Path, r.Service)
		}
	}

	return nil
}

func (c *Config) ServiceByName(name string) *ServiceConfig {
	for i := range c.Services {
		if c.Services[i].Name == name {
			return &c.Services[i]
		}
	}

	return nil
}
