#!/bin/sh
set -e

echo "Syncing database schema..."
for i in $(seq 1 15); do
  if npx drizzle-kit push --accept-data-loss 2>&1; then
    echo "Schema synced"
    break
  fi
  echo "  attempt $i/15 — retrying in 3s..."
  sleep 3
done

echo "Starting server..."
exec node dist/main.js
