#!/bin/bash

# Base Network Deployment Script
# Based on Base documentation: https://docs.base.org/cookbook/launch-ai-agents

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists git; then
        missing_deps+=("git")
    fi
    
    if ! command_exists psql; then
        missing_deps+=("PostgreSQL")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp env.example .env
        print_warning "Please edit .env file with your configuration before continuing."
        print_warning "Required variables:"
        print_warning "  - CDP_API_KEY_NAME"
        print_warning "  - CDP_API_KEY_PRIVATE_KEY"
        print_warning "  - NETWORK_ID (base-sepolia or base-mainnet)"
        print_warning "  - DATABASE_URL"
        print_warning "  - JWT_SECRET"
        exit 1
    fi
    
    # Load environment variables
    export $(cat .env | grep -v '^#' | xargs)
    
    print_success "Environment setup complete"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Install smart contract dependencies
    print_status "Installing smart contract dependencies..."
    cd smart-contracts
    npm install
    cd ..
    
    print_success "All dependencies installed"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    cd backend
    
    # Run migrations
    print_status "Running database migrations..."
    npm run migrate
    
    # Run seeds if they exist
    if [ -f "src/seeds/001_seed_data.js" ]; then
        print_status "Running database seeds..."
        npm run seed
    fi
    
    cd ..
    
    print_success "Database setup complete"
}

# Function to build smart contracts
build_contracts() {
    print_status "Building smart contracts..."
    
    cd smart-contracts
    
    # Clean previous builds
    npm run clean
    
    # Compile contracts
    print_status "Compiling smart contracts..."
    npm run compile
    
    # Run tests
    print_status "Running smart contract tests..."
    npm test
    
    cd ..
    
    print_success "Smart contracts built and tested"
}

# Function to deploy to Base Sepolia (testnet)
deploy_testnet() {
    print_status "Deploying to Base Sepolia testnet..."
    
    cd smart-contracts
    
    # Check if private key is set
    if [ -z "$PRIVATE_KEY" ]; then
        print_error "PRIVATE_KEY not set in .env file"
        exit 1
    fi
    
    # Deploy to Base Sepolia
    print_status "Deploying contracts to Base Sepolia..."
    npm run deploy:testnet
    
    cd ..
    
    print_success "Deployed to Base Sepolia testnet"
}

# Function to deploy to Base Mainnet
deploy_mainnet() {
    print_status "Deploying to Base Mainnet..."
    
    cd smart-contracts
    
    # Check if private key is set
    if [ -z "$PRIVATE_KEY" ]; then
        print_error "PRIVATE_KEY not set in .env file"
        exit 1
    fi
    
    # Confirm deployment
    print_warning "You are about to deploy to Base Mainnet!"
    print_warning "This will use real ETH for gas fees."
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 0
    fi
    
    # Deploy to Base Mainnet
    print_status "Deploying contracts to Base Mainnet..."
    npm run deploy:mainnet
    
    cd ..
    
    print_success "Deployed to Base Mainnet"
}

# Function to verify contracts on BaseScan
verify_contracts() {
    print_status "Verifying contracts on BaseScan..."
    
    cd smart-contracts
    
    # Check if contract address is set
    if [ -z "$CONTRACT_ADDRESS" ]; then
        print_error "CONTRACT_ADDRESS not set in .env file"
        exit 1
    fi
    
    # Verify contracts
    print_status "Verifying contracts..."
    npm run verify -- --contract-address $CONTRACT_ADDRESS
    
    cd ..
    
    print_success "Contracts verified on BaseScan"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd frontend
    
    # Build for production
    print_status "Building React app..."
    npm run build
    
    cd ..
    
    print_success "Frontend built successfully"
}

# Function to start development services
start_development() {
    print_status "Starting development services..."
    
    # Start backend in background
    print_status "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Start frontend in background
    print_status "Starting frontend server..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    print_success "Development services started"
    print_status "Backend: http://localhost:3001"
    print_status "Frontend: http://localhost:3000"
    print_status "Health check: http://localhost:3001/health"
    
    # Wait for user to stop
    print_status "Press Ctrl+C to stop all services"
    wait
}

# Function to stop development services
stop_development() {
    print_status "Stopping development services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    print_success "Development services stopped"
}

# Function to setup CDP AgentKit
setup_cdp_agentkit() {
    print_status "Setting up CDP AgentKit..."
    
    # Check if CDP credentials are set
    if [ -z "$CDP_API_KEY_NAME" ] || [ -z "$CDP_API_KEY_PRIVATE_KEY" ]; then
        print_error "CDP credentials not set in .env file"
        print_warning "Please set CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY"
        exit 1
    fi
    
    # Initialize CDP AgentKit
    cd backend
    print_status "Initializing CDP AgentKit..."
    node -e "
        const CDPAgentKitService = require('./src/services/cdpAgentKit');
        const cdpService = new CDPAgentKitService();
        cdpService.initialize()
            .then(() => console.log('CDP AgentKit initialized successfully'))
            .catch(err => {
                console.error('CDP AgentKit initialization failed:', err);
                process.exit(1);
            });
    "
    cd ..
    
    print_success "CDP AgentKit setup complete"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    print_status "Running backend tests..."
    cd backend
    npm test
    cd ..
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd frontend
    npm test -- --watchAll=false
    cd ..
    
    # Smart contract tests
    print_status "Running smart contract tests..."
    cd smart-contracts
    npm test
    cd ..
    
    print_success "All tests passed"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Stop development services
    stop_development
    
    # Clean build artifacts
    cd frontend
    rm -rf build
    cd ..
    
    cd smart-contracts
    npm run clean
    cd ..
    
    print_success "Cleanup complete"
}

# Function to show help
show_help() {
    echo "Base Network Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev           Start development environment"
    echo "  testnet       Deploy to Base Sepolia testnet"
    echo "  mainnet       Deploy to Base Mainnet"
    echo "  verify        Verify contracts on BaseScan"
    echo "  build         Build all components"
    echo "  test          Run all tests"
    echo "  setup         Setup environment and dependencies"
    echo "  cdp           Setup CDP AgentKit"
    echo "  clean         Clean build artifacts"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev        # Start development environment"
    echo "  $0 testnet    # Deploy to Base Sepolia"
    echo "  $0 mainnet    # Deploy to Base Mainnet"
}

# Main function
main() {
    local command=$1
    
    case $command in
        "dev")
            print_status "Starting development deployment..."
            check_dependencies
            setup_environment
            install_dependencies
            setup_database
            build_contracts
            setup_cdp_agentkit
            start_development
            ;;
        "testnet")
            print_status "Starting testnet deployment..."
            check_dependencies
            setup_environment
            install_dependencies
            build_contracts
            deploy_testnet
            print_success "Testnet deployment completed!"
            ;;
        "mainnet")
            print_status "Starting mainnet deployment..."
            check_dependencies
            setup_environment
            install_dependencies
            build_contracts
            deploy_mainnet
            verify_contracts
            print_success "Mainnet deployment completed!"
            ;;
        "verify")
            setup_environment
            verify_contracts
            ;;
        "build")
            print_status "Building all components..."
            install_dependencies
            build_contracts
            build_frontend
            print_success "Build completed!"
            ;;
        "test")
            install_dependencies
            run_tests
            ;;
        "setup")
            print_status "Setting up project..."
            check_dependencies
            setup_environment
            install_dependencies
            setup_database
            setup_cdp_agentkit
            print_success "Setup completed!"
            ;;
        "cdp")
            setup_environment
            setup_cdp_agentkit
            ;;
        "clean")
            cleanup
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Handle script interruption
trap cleanup EXIT

# Run main function with all arguments
main "$@" 