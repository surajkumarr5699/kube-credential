#!/bin/bash

# Build All Docker Images Script
# This script builds all Docker images for the Kube Credential application

set -e

echo "======================================"
echo "Building Kube Credential Docker Images"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "\n${BLUE}Building Issuance Service...${NC}"
cd "$PROJECT_ROOT/services/issuance-service"
docker build -t issuance-service:latest .
echo -e "${GREEN}✓ Issuance Service built successfully${NC}"

echo -e "\n${BLUE}Building Verification Service...${NC}"
cd "$PROJECT_ROOT/services/verification-service"
docker build -t verification-service:latest .
echo -e "${GREEN}✓ Verification Service built successfully${NC}"

echo -e "\n${BLUE}Building Frontend...${NC}"
cd "$PROJECT_ROOT/frontend"
docker build -t kube-credential-frontend:latest .
echo -e "${GREEN}✓ Frontend built successfully${NC}"

echo -e "\n${GREEN}======================================"
echo "All images built successfully!"
echo "======================================${NC}"

echo -e "\nBuilt images:"
docker images | grep -E "issuance-service|verification-service|kube-credential-frontend" | head -3
