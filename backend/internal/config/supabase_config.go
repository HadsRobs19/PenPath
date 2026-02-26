package config

type SupabaseConfig struct {
	ProjectURL     string `json:"project_url"`
	AuthURL        string `json:"auth_url"`
	JWTSecret      string `json:"jwt_secret"`       // via HS256 secret; this should probs be loaded from env variables
	ServiceRoleKey string `json:"service_role_key"` // If backend performs privileged actions
}
