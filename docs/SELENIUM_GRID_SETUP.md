# Selenium Grid Setup and Testing

This document explains how to run tests on Selenium Grid both locally and in CI/CD pipelines.

## Overview

The Selenium Grid setup allows running tests in a distributed environment with multiple browser nodes. This is useful for:
- Parallel test execution
- Testing on different browser versions
- Simulating real-world distributed testing scenarios
- CI/CD pipeline testing

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- All project dependencies installed (`npm install`)

### Starting the Grid

**Windows (PowerShell):**
```powershell
# Start the grid
.\scripts\grid.ps1 start

# Check status
.\scripts\grid.ps1 status

# Run tests
.\scripts\grid.ps1 test

# Stop the grid
.\scripts\grid.ps1 stop
```

**Linux/Mac (Bash):**
```bash
# Start the grid
./scripts/grid.sh start

# Check status
./scripts/grid.sh status

# Run tests
./scripts/grid.sh test

# Stop the grid
./scripts/grid.sh stop
```

**Using NPM scripts:**
```bash
# Start the grid
npm run grid:start

# Check status
npm run grid:status

# Run tests
npm run grid:test

# Stop the grid
npm run grid:stop
```

## Configuration

### Environment Variables

The following environment variables control the Selenium Grid configuration:

```bash
# Grid execution mode
WEB_EXECUTION_MODE=grid

# Grid hub URL
SELENIUM_GRID_HUB_URL=http://localhost:4444/wd/hub

# Browser configuration
SELENIUM_GRID_BROWSER_NAME=chrome
SELENIUM_GRID_BROWSER_VERSION=latest
SELENIUM_GRID_PLATFORM_NAME=linux

# Grid capacity
SELENIUM_GRID_MAX_INSTANCES=2
SELENIUM_GRID_NODE_TIMEOUT=30
SELENIUM_GRID_SESSION_TIMEOUT=300
```

### Docker Compose Configuration

The grid is configured in `docker-compose.test.yml`:

- **Hub**: Selenium Grid Hub (port 4444)
- **Chrome Node**: Chrome browser node with 2GB shared memory
- **Networking**: Custom bridge network for container communication
- **Health Checks**: Automatic health monitoring

## Running Tests

### Local Development

1. **Start the grid:**
   ```bash
   npm run grid:start
   ```

2. **Run tests:**
   ```bash
   npm run test:web:grid
   ```

3. **Monitor tests:**
   - Grid Console: http://localhost:4444/ui
   - VNC (if enabled): http://localhost:7900 (password: secret)

### CI/CD Pipeline

The CI pipeline automatically:

1. Starts Selenium Grid using Docker Compose
2. Waits for grid readiness with comprehensive health checks
3. Sets environment variables for grid connection
4. Runs tests with proper error handling
5. Captures test results and artifacts
6. Cleans up grid resources

### Manual Docker Commands

If you prefer manual control:

```bash
# Start grid manually
docker-compose -f docker-compose.test.yml up -d selenium-hub selenium-chrome

# Check grid status
curl http://localhost:4444/wd/hub/status

# Run tests
WEB_EXECUTION_MODE=grid npm run test:web:grid

# Stop grid
docker-compose -f docker-compose.test.yml down
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   ```
   Error: browserType.connect: WebSocket error: ws://host:port/ws *** Bad Request
   ```
   
   **Solutions:**
   - Ensure grid is fully started: `npm run grid:status`
   - Check if Chrome node is registered
   - Verify network connectivity between containers
   - Check Docker logs: `docker-compose -f docker-compose.test.yml logs`

2. **Grid Not Ready**
   ```
   Grid validation failed: Grid is not ready
   ```
   
   **Solutions:**
   - Wait longer for grid startup
   - Check Docker resources (memory, CPU)
   - Restart grid: `npm run grid:restart`

3. **Browser Node Not Registering**
   
   **Solutions:**
   - Check hub logs: `docker logs selenium-hub-test`
   - Check node logs: `docker logs selenium-chrome-test`
   - Verify network configuration
   - Increase startup timeout

### Debugging Commands

```bash
# Check grid status with details
curl -s http://localhost:4444/wd/hub/status | jq '.'

# View grid console in browser
open http://localhost:4444/ui

# Check container logs
docker-compose -f docker-compose.test.yml logs selenium-hub
docker-compose -f docker-compose.test.yml logs selenium-chrome

# Check container networking
docker network ls
docker inspect testfusion-enterprise_test-network
```

### Performance Tuning

For better performance:

1. **Increase shared memory:**
   ```yaml
   selenium-chrome:
     shm_size: 4gb  # Increase from 2gb
   ```

2. **Adjust timeouts:**
   ```bash
   SELENIUM_GRID_NODE_TIMEOUT=60
   SELENIUM_GRID_SESSION_TIMEOUT=600
   ```

3. **Scale nodes:**
   ```bash
   docker-compose -f docker-compose.test.yml up -d --scale selenium-chrome=3
   ```

## Grid Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Test Runner   │◄──►│  Selenium Hub   │
│  (Playwright)   │    │   (Port 4444)   │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Chrome Node    │
                    │  (2 instances)  │
                    └─────────────────┘
```

The hub manages test distribution and node registration, while nodes execute the actual browser automation.

## Best Practices

1. **Always check grid status** before running tests
2. **Use proper timeouts** to avoid hanging tests
3. **Monitor resource usage** during test execution
4. **Clean up grid resources** after testing
5. **Use health checks** to ensure grid stability
6. **Log grid status** for debugging failed tests
7. **Scale nodes** based on test parallelization needs

## Support

For issues with the grid setup:

1. Check the troubleshooting section above
2. Review Docker and container logs
3. Verify network connectivity
4. Check resource availability (memory, disk space)
5. Consult Selenium Grid documentation for advanced configuration
