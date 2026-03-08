package config

// StorageConfig holds the values needed to interact with Supabase Storage.
// Supabase Storage is used to store user-uploaded files such as handwriting samples.
type StorageConfig struct {
	// BucketName is the Supabase Storage bucket PenPath reads and writes files to.
	BucketName string `json:"storage_bucket_name"`

	// StorageURL is the full URL to the Supabase Storage API.
	// Format: https://<project-ref>.supabase.co/storage/v1
	StorageURL string `json:"storage_url"`
}
