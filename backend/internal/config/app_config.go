package config

// hold the configuration or set up of all app sub configs
type AppConfig struct {
	CaddyConfig    CaddyConfig    `json:"caddy_config"`
	DBConfig       DBConfig       `json:"db_config"`
	JWTConfig      JWTConfig      `json:"jwt_config"`
	StorageConfig  StorageConfig  `json:"storage_config`
	SupabaseConfig SupabaseConfig `json:"supabase_config`
	ServiceConfig  ServiceConfig  `json:"service_config"`
}
