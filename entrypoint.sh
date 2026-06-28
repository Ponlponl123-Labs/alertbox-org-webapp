#!/bin/sh
set -e

# Injecting runtime environment variables via env.js
echo "Generating runtime env.js..."

mkdir -p /app/public

if [ -n "$API_ENDPOINT" ]; then
  echo "Setting API_ENDPOINT to $API_ENDPOINT"
  echo "window.__RUNTIME_API_ENDPOINT = '${API_ENDPOINT}';" > /app/public/env.js
else
  echo "API_ENDPOINT is not set, leaving empty string"
  echo "window.__RUNTIME_API_ENDPOINT = '';" > /app/public/env.js
fi

# Execute the main command
exec "$@"