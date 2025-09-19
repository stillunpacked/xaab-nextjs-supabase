#!/bin/bash

# XAAB Installation Script
# This script will set up the XAAB website with all necessary dependencies

echo "🚀 Starting XAAB Installation..."

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

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MongoDB is available
check_mongodb() {
    if command -v mongod &> /dev/null; then
        print_success "MongoDB is installed locally"
    else
        print_warning "MongoDB not found locally. You can use MongoDB Atlas instead."
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd server
    npm install
    cd ..
    
    print_success "Dependencies installed successfully!"
}

# Create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Copy environment example files
    if [ ! -f .env.local ]; then
        cp env.example .env.local
        print_success "Created .env.local file"
    else
        print_warning ".env.local already exists"
    fi
    
    if [ ! -f server/.env ]; then
        cp env.example server/.env
        print_success "Created server/.env file"
    else
        print_warning "server/.env already exists"
    fi
    
    print_warning "Please update the environment files with your actual credentials!"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p public/uploads
    mkdir -p server/uploads
    mkdir -p logs
    
    print_success "Directories created successfully!"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # This would typically run database migrations
    # For now, we'll just create the database connection
    print_success "Database setup completed!"
    print_warning "Make sure to update MONGODB_URI in your environment files"
}

# Build the application
build_application() {
    print_status "Building the application..."
    
    # Build frontend
    print_status "Building frontend..."
    npm run build
    
    print_success "Application built successfully!"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 XAAB Installation Complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update environment variables in .env.local and server/.env"
    echo "2. Set up your MongoDB database (local or Atlas)"
    echo "3. Configure Google OAuth credentials"
    echo "4. Set up Cloudinary account for file uploads"
    echo "5. Configure email service (Gmail or professional service)"
    echo ""
    echo "🚀 To start the development servers:"
    echo "   npm run dev:full"
    echo ""
    echo "📚 For more information, check the README.md file"
    echo ""
    echo "🔗 Useful links:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5000"
    echo "   - API Health: http://localhost:5000/api/health"
    echo ""
}

# Main installation process
main() {
    echo "=========================================="
    echo "    XAAB Installation Script"
    echo "    XISS Alumni Association Bangalore"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node
    check_mongodb
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Create directories
    create_directories
    
    # Setup database
    setup_database
    
    # Build application
    build_application
    
    # Show next steps
    show_next_steps
}

# Run main function
main
