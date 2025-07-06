#!/bin/bash

# Wait for Selenium Grid Script
# Ensures Selenium Grid is fully ready before running tests

set -e

GRID_URL=${1:-"http://localhost:4444"}
MAX_WAIT=${2:-120}
CHECK_INTERVAL=${3:-3}

echo "🔍 Checking Selenium Grid at: $GRID_URL"
echo "⏰ Max wait time: ${MAX_WAIT}s, Check interval: ${CHECK_INTERVAL}s"

# Function to check if grid hub is responding
check_hub_status() {
    local url="$1/wd/hub/status"
    curl -sSf "$url" > /dev/null 2>&1
}

# Function to check if chrome node is registered and ready
check_node_ready() {
    local url="$1/wd/hub/status"
    local response=$(curl -sSf "$url" 2>/dev/null)
    echo "$response" | grep -q '"ready":true' && echo "$response" | grep -q '"chrome"'
}

# Function to get grid status
get_grid_status() {
    local url="$1/wd/hub/status"
    curl -sSf "$url" 2>/dev/null | jq '.' 2>/dev/null || echo "Could not parse JSON response"
}

echo "🚀 Step 1: Waiting for Selenium Grid hub to be accessible..."
wait_time=0
while ! check_hub_status "$GRID_URL"; do
    if [ $wait_time -ge $MAX_WAIT ]; then
        echo "❌ Timeout: Selenium Grid hub did not become accessible within ${MAX_WAIT}s"
        exit 1
    fi
    echo "⏳ Hub not ready yet, waiting... (${wait_time}/${MAX_WAIT}s)"
    sleep $CHECK_INTERVAL
    wait_time=$((wait_time + CHECK_INTERVAL))
done

echo "✅ Selenium Grid hub is accessible"

echo "🚀 Step 2: Waiting for Chrome node to register and be ready..."
wait_time=0
while ! check_node_ready "$GRID_URL"; do
    if [ $wait_time -ge $MAX_WAIT ]; then
        echo "❌ Timeout: Chrome node did not become ready within ${MAX_WAIT}s"
        echo "📊 Final grid status:"
        get_grid_status "$GRID_URL"
        exit 1
    fi
    echo "⏳ Chrome node not ready yet, waiting... (${wait_time}/${MAX_WAIT}s)"
    sleep $CHECK_INTERVAL
    wait_time=$((wait_time + CHECK_INTERVAL))
done

echo "✅ Chrome node is registered and ready"

echo "📊 Final Grid Status:"
get_grid_status "$GRID_URL"

echo "🎉 Selenium Grid is fully ready for testing!"
exit 0
