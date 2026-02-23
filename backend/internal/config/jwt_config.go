package config

type JWTConfig struct {
	Key    string `json:"jwt-key"`
	Issuer string `json:"jwt-issuer"`
}
