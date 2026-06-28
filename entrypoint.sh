#!/bin/sh
set -e

# Replace the placeholder with the actual environment variable
# API_ENDPOINT is provided by Kubernetes at runtime
echo "Injecting runtime environment variables..."

if [ -n "$API_ENDPOINT" ]; then
  echo "Setting API_ENDPOINT to $API_ENDPOINT"
  find /app/.next /app/server.js -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|__API_ENDPOINT_PLACEHOLDER__|${API_ENDPOINT}|g" {} +
else
  echo "API_ENDPOINT is not set, leaving empty string"
  find /app/.next /app/server.js -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|__API_ENDPOINT_PLACEHOLDER__||g" {} +
fi

# Execute the provided CMD
exec "$@"