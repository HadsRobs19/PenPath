package config

type JWTConfig struct {
	Issuer        string `json:"issuer"`
	Audience      string `json:"audience"`
	SigningMethod string `json:"signing_method"` // e.g. HS256 or RS256
	UseJWKS       bool   `json:"use_jwks"`
	//JWKSURL       string `json:"jwks_url"`
}
