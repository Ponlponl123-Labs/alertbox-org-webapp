#!/bin/sh
set -e

echo "Injecting runtime environment variables..."

if [ -n "" ]; then
  echo "Setting API_ENDPOINT to "
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|__API_ENDPOINT_PLACEHOLDER__||g" {} +
else
  echo "API_ENDPOINT is not set, leaving empty string"
  find /app/.next -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|__API_ENDPOINT_PLACEHOLDER__||g" {} +
fi

exec "$@"