# dev.ps1 — PenPath local development startup script
#
# What this does:
#   1. Reads every key=value line from .env.local
#   2. Sets each one as an environment variable for this session
#   3. Deletes config.json so the Go server regenerates it with the real values
#   4. Starts the Fiber backend
#
# Run from inside the backend/ folder:
#   .\dev.ps1

$envFile = ".env.local"

if (-not (Test-Path $envFile)) {
    Write-Error "Could not find $envFile. Copy .env.example to .env.local and fill in your values."
    exit 1
}

# Read each line, skip blank lines and comments
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }

    $parts = $line -split "=", 2
    if ($parts.Length -eq 2) {
        $key   = $parts[0].Trim()
        $value = $parts[1].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        Write-Host "Loaded: $key"
    }
}

Write-Host ""
Write-Host "Starting PenPath Fiber backend..."
Write-Host ""

go run ./cmd/server