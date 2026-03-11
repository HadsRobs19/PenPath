package config

// CaddyConfig holds the values needed to describe how Caddy is configured.
// Caddy runs in front of the Fiber app and handles TLS, HTTP->HTTPS redirects,
// and reverse proxying all incoming traffic to the correct Fiber process.
//
// Domain routing strategy:
//   - Production:  api.penpath.app     -> localhost:3000
//   - Staging:     staging.penpath.app -> localhost:3001
//   - Local dev:   no Caddy, Fiber runs directly on localhost:3000
type CaddyConfig struct {
	// AdminAPI is Caddy's local admin API address. Used to reload or query Caddy config at runtime.
	// Default: localhost:2019
	AdminAPI string `json:"caddy_admin_api"`

	// PublicHost is the domain name Caddy is serving for this environment.
	// Production:  api.penpath.app
	// Staging:     staging.penpath.app
	PublicHost string `json:"caddy_public_host"`

	// ProxyTarget is where Caddy forwards every incoming request.
	// Must match Fiber's listening address (IPv4Host:IPv4Port in ServiceConfig).
	// Production:  localhost:3000
	// Staging:     localhost:3001
	ProxyTarget string `json:"caddy_proxy_target"`
}
