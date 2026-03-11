package config

type ServiceConfig struct {
	IPv4Host    string `json:"ipv4_service_host"`
	IPv4Port    string `json:"ipv4_service_port"`
	IPv4Enabled bool   `json:"ipv4_enabled"`
	IPv6Host    string `json:"ipv6_service_host"`
	IPv6Port    string `json:"ipv6_service_port"`
	IPv6Enabled bool   `json:"ipv6_enabled"`
}
