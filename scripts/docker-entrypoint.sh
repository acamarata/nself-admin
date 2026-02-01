#!/bin/sh
set -e

# Graceful shutdown handler for nself-admin
# Handles SIGTERM from Docker to properly close connections

# PID of the main application
APP_PID=""

# Shutdown handler
shutdown() {
  echo "Received SIGTERM, starting graceful shutdown..."

  if [ -n "$APP_PID" ]; then
    echo "Stopping application (PID: $APP_PID)..."

    # Send SIGTERM to Node.js process
    kill -TERM "$APP_PID" 2>/dev/null || true

    # Wait up to 30 seconds for graceful shutdown
    for i in $(seq 1 30); do
      if ! kill -0 "$APP_PID" 2>/dev/null; then
        echo "Application stopped gracefully"
        exit 0
      fi
      echo "Waiting for graceful shutdown... ($i/30)"
      sleep 1
    done

    # Force kill if still running after 30 seconds
    echo "Force killing application..."
    kill -KILL "$APP_PID" 2>/dev/null || true
  fi

  exit 0
}

# Trap SIGTERM and SIGINT
trap shutdown SIGTERM SIGINT

echo "Starting nself-admin..."

# Start the application in background
"$@" &
APP_PID=$!

echo "Application started (PID: $APP_PID)"

# Wait for the application process
wait "$APP_PID"
EXIT_CODE=$?

echo "Application exited with code: $EXIT_CODE"
exit $EXIT_CODE
