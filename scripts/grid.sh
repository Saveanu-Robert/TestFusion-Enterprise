#!/bin/bash

# Selenium Grid Management Script
# Manages local Selenium Grid for development and testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.test.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[GRID]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[GRID]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[GRID]${NC} $1"
}

print_error() {
    echo -e "${RED}[GRID]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start Selenium Grid
start_grid() {
    print_status "Starting Selenium Grid..."
    
    check_docker
    
    # Stop any existing grid containers
    print_status "Stopping any existing grid containers..."
    docker-compose -f "$COMPOSE_FILE" down selenium-hub selenium-chrome 2>/dev/null || true
    
    # Start the grid
    print_status "Starting grid containers..."
    docker-compose -f "$COMPOSE_FILE" up -d selenium-hub selenium-chrome
    
    # Wait for grid to be ready
    print_status "Waiting for grid to be ready..."
    "$SCRIPT_DIR/wait-for-grid.sh" "http://localhost:4444" 120 3
    
    print_success "Selenium Grid is ready!"
    print_status "Grid URL: http://localhost:4444"
    print_status "Grid Console: http://localhost:4444/ui"
}

# Function to stop Selenium Grid
stop_grid() {
    print_status "Stopping Selenium Grid..."
    
    docker-compose -f "$COMPOSE_FILE" down selenium-hub selenium-chrome
    
    print_success "Selenium Grid stopped."
}

# Function to show grid status
status_grid() {
    print_status "Checking grid status..."
    
    if curl -sSf http://localhost:4444/wd/hub/status > /dev/null 2>&1; then
        print_success "Grid is running"
        echo
        print_status "Grid Status Details:"
        curl -s http://localhost:4444/wd/hub/status | jq '.' 2>/dev/null || echo "Could not parse status JSON"
        echo
        print_status "Grid Console: http://localhost:4444/ui"
    else
        print_warning "Grid is not running"
    fi
}

# Function to show logs
logs_grid() {
    print_status "Showing grid logs..."
    docker-compose -f "$COMPOSE_FILE" logs -f selenium-hub selenium-chrome
}

# Function to run tests on grid
test_grid() {
    print_status "Running tests on Selenium Grid..."
    
    # Check if grid is running
    if ! curl -sSf http://localhost:4444/wd/hub/status > /dev/null 2>&1; then
        print_warning "Grid is not running. Starting it first..."
        start_grid
    fi
    
    # Run the tests
    cd "$PROJECT_ROOT"
    npm run test:web:grid
}

# Function to show usage
usage() {
    echo "Usage: $0 {start|stop|status|logs|test|restart}"
    echo
    echo "Commands:"
    echo "  start   - Start Selenium Grid"
    echo "  stop    - Stop Selenium Grid"
    echo "  status  - Show grid status"
    echo "  logs    - Show grid logs"
    echo "  test    - Run tests on grid"
    echo "  restart - Restart Selenium Grid"
    echo
    exit 1
}

# Main script logic
case "${1:-}" in
    start)
        start_grid
        ;;
    stop)
        stop_grid
        ;;
    status)
        status_grid
        ;;
    logs)
        logs_grid
        ;;
    test)
        test_grid
        ;;
    restart)
        stop_grid
        sleep 2
        start_grid
        ;;
    *)
        usage
        ;;
esac
