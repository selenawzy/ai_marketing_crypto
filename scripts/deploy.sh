#!/bin/bash

# AI Agent Marketplace Deployment Script
# This script deploys the entire project including backend, frontend, and smart contracts

set -e

echo "🚀 Starting AI Agent Marketplace deployment..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker found"
    else
        print_warning "Docker not found. Some services may need manual setup."
    fi
    
    # Check PostgreSQL
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL client found"
    else
        print_warning "PostgreSQL client not found. Database setup may need manual configuration."
    fi
    
    print_success "Dependency check completed"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        cp env.example .env
        print_warning "Created .env file from template. Please configure your environment variables."
    fi
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p uploads
    mkdir -p data
    
    print_success "Environment setup completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    if [ -d "backend" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi
    
    # Install frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    # Install smart contract dependencies
    if [ -d "smart-contracts" ]; then
        print_status "Installing smart contract dependencies..."
        cd smart-contracts
        npm install
        cd ..
    fi
    
    # Install extension dependencies
    if [ -d "extension" ]; then
        print_status "Installing extension dependencies..."
        cd extension
        npm install
        cd ..
    fi
    
    print_success "All dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is running
    if command -v pg_isready &> /dev/null; then
        if pg_isready -q; then
            print_success "PostgreSQL is running"
        else
            print_warning "PostgreSQL is not running. Please start PostgreSQL first."
            return 1
        fi
    fi
    
    # Run database migrations
    if [ -d "backend" ]; then
        cd backend
        print_status "Running database migrations..."
        npm run migrate
        cd ..
    fi
    
    print_success "Database setup completed"
}

# Build smart contracts
build_contracts() {
    print_status "Building smart contracts..."
    
    if [ -d "smart-contracts" ]; then
        cd smart-contracts
        
        # Compile contracts
        print_status "Compiling smart contracts..."
        npm run compile
        
        # Run tests
        print_status "Running smart contract tests..."
        npm test
        
        cd ..
        print_success "Smart contracts built and tested"
    else
        print_warning "Smart contracts directory not found"
    fi
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    if [ -d "frontend" ]; then
        cd frontend
        
        # Build for production
        print_status "Building React application..."
        npm run build
        
        cd ..
        print_success "Frontend built successfully"
    else
        print_warning "Frontend directory not found"
    fi
}

# Build extension
build_extension() {
    print_status "Building browser extension..."
    
    if [ -d "extension" ]; then
        cd extension
        
        # Create extension icons if they don't exist
        if [ ! -d "icons" ]; then
            mkdir -p icons
            print_warning "Extension icons not found. Please add icon files to extension/icons/"
        fi
        
        cd ..
        print_success "Extension prepared"
    else
        print_warning "Extension directory not found"
    fi
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start backend
    if [ -d "backend" ]; then
        print_status "Starting backend server..."
        cd backend
        npm run dev &
        BACKEND_PID=$!
        cd ..
        print_success "Backend started (PID: $BACKEND_PID)"
    fi
    
    # Start frontend
    if [ -d "frontend" ]; then
        print_status "Starting frontend development server..."
        cd frontend
        npm start &
        FRONTEND_PID=$!
        cd ..
        print_success "Frontend started (PID: $FRONTEND_PID)"
    fi
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    print_success "All services started"
}

# Deploy to production
deploy_production() {
    print_status "Deploying to production..."
    
    # Build everything for production
    build_contracts
    build_frontend
    build_extension
    
    # Deploy smart contracts
    if [ -d "smart-contracts" ]; then
        cd smart-contracts
        print_status "Deploying smart contracts to Base mainnet..."
        npm run deploy:mainnet
        cd ..
    fi
    
    print_success "Production deployment completed"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    
    # Kill background processes
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm .backend.pid
    fi
    
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm .frontend.pid
    fi
    
    print_success "Cleanup completed"
}

# Main deployment function
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
            start_services
            print_success "Development environment ready!"
            print_status "Backend: http://localhost:3001"
            print_status "Frontend: http://localhost:3000"
            print_status "Press Ctrl+C to stop services"
            
            # Wait for interrupt
            trap cleanup EXIT
            wait
            ;;
        "prod")
            print_status "Starting production deployment..."
            check_dependencies
            setup_environment
            install_dependencies
            setup_database
            deploy_production
            print_success "Production deployment completed!"
            ;;
        "clean")
            cleanup
            print_success "Cleanup completed"
            ;;
        "install")
            check_dependencies
            setup_environment
            install_dependencies
            print_success "Installation completed"
            ;;
        "build")
            build_contracts
            build_frontend
            build_extension
            print_success "Build completed"
            ;;
        *)
            echo "Usage: $0 {dev|prod|clean|install|build}"
            echo "  dev    - Start development environment"
            echo "  prod   - Deploy to production"
            echo "  clean  - Clean up running services"
            echo "  install - Install dependencies only"
            echo "  build  - Build all components"
            exit 1
            ;;
    esac
}

# Run main function with command line argument
main "$@" 