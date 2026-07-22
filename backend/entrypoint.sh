#!/bin/sh
set -e

echo "Running database migrations..."
for i in $(seq 1 15); do
  if npx drizzle-kit migrate 2>&1; then
    echo "Migrations complete"
    break
  fi
  echo "  attempt $i/15 — retrying in 3s..."
  sleep 3
done

echo "Starting server..."
exec node dist/main.js
