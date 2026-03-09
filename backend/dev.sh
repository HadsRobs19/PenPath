#!/usr/bin/env bash
# dev.sh - PenPath local development startup script (Mac/Linux)
#
# What this does:
#   1. Reads every key=value line from .env.local
#   2. Exports each one as an environment variable for this session
#   3. Starts the Fiber backend
#
# Run from inside the backend/ folder:
#   chmod +x dev.sh   (only needed once, makes the file executable)
#   ./dev.sh

ENV_FILE=".env.local"

# Check the env file exists before doing anything
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found."
  echo "Copy .env.example to .env.local and fill in your values."
  exit 1
fi

# Read each line from the env file
while IFS= read -r line || [ -n "$line" ]; do
  # Skip blank lines and comment lines starting with #
  [[ -z "$line" || "$line" == \#* ]] && continue

  # Split on the first = only (values may contain = signs e.g. base64 keys)
  key="${line%%=*}"
  value="${line#*=}"

  # Export so child processes (the Go server) can read them
  export "$key"="$value"
  echo "Loaded: $key"

done < "$ENV_FILE"

echo ""
echo "Starting PenPath Fiber backend..."
echo ""

go run ./cmd/server
