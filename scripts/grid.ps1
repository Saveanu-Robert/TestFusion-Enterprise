# Selenium Grid Management Script for Windows
# Manages local Selenium Grid for development and testing

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "status", "logs", "test", "restart")]
    [string]$Action
)

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR
$COMPOSE_FILE = Join-Path $PROJECT_ROOT "docker-compose.test.yml"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[GRID] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[GRID] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[GRID] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[GRID] $Message" -ForegroundColor Red
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info *>$null
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker first."
        exit 1
    }
}

# Function to start Selenium Grid
function Start-Grid {
    Write-Status "Starting Selenium Grid..."
    
    Test-Docker
    
    # Stop any existing grid containers
    Write-Status "Stopping any existing grid containers..."
    try {
        docker-compose -f $COMPOSE_FILE down selenium-hub selenium-chrome 2>$null
    }
    catch {
        # Ignore errors if containers don't exist
    }
    
    # Start the grid
    Write-Status "Starting grid containers..."
    docker-compose -f $COMPOSE_FILE up -d selenium-hub selenium-chrome
    
    # Wait for grid to be ready
    Write-Status "Waiting for grid to be ready..."
    Wait-ForGrid
    
    Write-Success "Selenium Grid is ready!"
    Write-Status "Grid URL: http://localhost:4444"
    Write-Status "Grid Console: http://localhost:4444/ui"
}

# Function to wait for grid to be ready
function Wait-ForGrid {
    $timeout = 120
    $interval = 3
    $elapsed = 0
    
    Write-Status "Checking grid readiness..."
    
    while ($elapsed -lt $timeout) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:4444/wd/hub/status" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                $status = $response.Content | ConvertFrom-Json
                if ($status.value.ready -eq $true) {
                    Write-Success "Grid is ready!"
                    return
                }
            }
        }
        catch {
            # Continue waiting
        }
        
        Write-Status "Waiting for grid... ($elapsed/$timeout seconds)"
        Start-Sleep $interval
        $elapsed += $interval
    }
    
    Write-Error "Timeout: Grid did not become ready within $timeout seconds"
    exit 1
}

# Function to stop Selenium Grid
function Stop-Grid {
    Write-Status "Stopping Selenium Grid..."
    
    docker-compose -f $COMPOSE_FILE down selenium-hub selenium-chrome
    
    Write-Success "Selenium Grid stopped."
}

# Function to show grid status
function Get-GridStatus {
    Write-Status "Checking grid status..."
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4444/wd/hub/status" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Grid is running"
            Write-Host ""
            Write-Status "Grid Status Details:"
            $status = $response.Content | ConvertFrom-Json
            $status | ConvertTo-Json -Depth 10
            Write-Host ""
            Write-Status "Grid Console: http://localhost:4444/ui"
        }
    }
    catch {
        Write-Warning "Grid is not running"
    }
}

# Function to show logs
function Show-GridLogs {
    Write-Status "Showing grid logs..."
    docker-compose -f $COMPOSE_FILE logs -f selenium-hub selenium-chrome
}

# Function to run tests on grid
function Test-Grid {
    Write-Status "Running tests on Selenium Grid..."
    
    # Check if grid is running
    try {
        Invoke-WebRequest -Uri "http://localhost:4444/wd/hub/status" -UseBasicParsing -TimeoutSec 5 *>$null
    }
    catch {
        Write-Warning "Grid is not running. Starting it first..."
        Start-Grid
    }
    
    # Run the tests
    Set-Location $PROJECT_ROOT
    npm run test:web:grid
}

# Function to show usage
function Show-Usage {
    Write-Host "Usage: grid.ps1 {start|stop|status|logs|test|restart}"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start   - Start Selenium Grid"
    Write-Host "  stop    - Stop Selenium Grid"
    Write-Host "  status  - Show grid status"
    Write-Host "  logs    - Show grid logs"
    Write-Host "  test    - Run tests on grid"
    Write-Host "  restart - Restart Selenium Grid"
    Write-Host ""
    exit 1
}

# Main script logic
switch ($Action) {
    "start" {
        Start-Grid
    }
    "stop" {
        Stop-Grid
    }
    "status" {
        Get-GridStatus
    }
    "logs" {
        Show-GridLogs
    }
    "test" {
        Test-Grid
    }
    "restart" {
        Stop-Grid
        Start-Sleep 2
        Start-Grid
    }
    default {
        Show-Usage
    }
}
