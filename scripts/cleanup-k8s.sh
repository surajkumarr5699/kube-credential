#!/bin/bash

# Cleanup Kubernetes Resources Script
# This script removes all Kube Credential resources from Kubernetes

set -e

echo "======================================"
echo "Cleaning up Kube Credential from Kubernetes"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Confirm deletion
echo -e "${YELLOW}This will delete all resources in the kube-credential namespace.${NC}"
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo -e "\n${BLUE}Deleting namespace and all resources...${NC}"
kubectl delete namespace kube-credential

echo -e "\n${GREEN}======================================"
echo "Cleanup completed!"
echo "======================================${NC}"
