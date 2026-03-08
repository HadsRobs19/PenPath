package config

// CaddyConfig holds the values needed to describe how Caddy is configured.
// Caddy runs in front of the Fiber app and handles TLS, HTTP->HTTPS redirects,
// and reverse proxying all incoming traffic to the Fiber backend.
type CaddyConfig struct {
	// AdminAPI is Caddy's local admin API address. Used to reload or query Caddy config at runtime.
	// Default: localhost:2019
	AdminAPI string `json:"caddy_admin_api"`

	// PublicHost is the domain name Caddy is serving.
	// This is the address the outside world uses to reach PenPath.
	// Example: penpath.app
	PublicHost string `json:"caddy_public_host"`

	// ProxyTarget is where Caddy forwards every incoming request.
	// Must match Fiber's listening address (IPv4Host:IPv4Port in ServiceConfig).
	// Example: localhost:3000
	ProxyTarget string `json:"caddy_proxy_target"`
}
