#!/bin/sh
set -e

echo "Waiting for database..."
for i in $(seq 1 30); do
  if npx drizzle-kit migrate 2>/dev/null; then
    echo "Migration complete"
    break
  fi
  echo "  attempt $i/30 — retrying in 2s..."
  sleep 2
done

echo "Starting server..."
exec node dist/main.js
