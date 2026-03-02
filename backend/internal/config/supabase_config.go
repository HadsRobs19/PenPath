package config

type SupabaseConfig struct {
	ProjectURL     string `json:"project_url"`
	AuthURL        string `json:"auth_url"`
	ServiceRoleKey string `json:"service_role_key"` // If backend performs privileged actions
}
