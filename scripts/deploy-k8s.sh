#!/bin/bash

# Deploy to Kubernetes Script
# This script deploys the Kube Credential application to Kubernetes

set -e

echo "======================================"
echo "Deploying Kube Credential to Kubernetes"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

# Apply Kubernetes manifests
echo -e "\n${BLUE}Creating namespace...${NC}"
kubectl apply -f "$PROJECT_ROOT/k8s/namespace.yaml"

echo -e "\n${BLUE}Applying ConfigMap...${NC}"
kubectl apply -f "$PROJECT_ROOT/k8s/configmap.yaml"

echo -e "\n${BLUE}Deploying Issuance Service...${NC}"
kubectl apply -f "$PROJECT_ROOT/k8s/issuance-deployment.yaml"

echo -e "\n${BLUE}Deploying Verification Service...${NC}"
kubectl apply -f "$PROJECT_ROOT/k8s/verification-deployment.yaml"

echo -e "\n${BLUE}Deploying Frontend...${NC}"
kubectl apply -f "$PROJECT_ROOT/k8s/frontend-deployment.yaml"

echo -e "\n${BLUE}Applying HPA...${NC}"
kubectl apply -f "$PROJECT_ROOT/k8s/hpa.yaml"

echo -e "\n${YELLOW}Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/issuance-service -n kube-credential || true
kubectl wait --for=condition=available --timeout=300s deployment/verification-service -n kube-credential || true
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n kube-credential || true

echo -e "\n${GREEN}======================================"
echo "Deployment completed!"
echo "======================================${NC}"

echo -e "\n${BLUE}Deployment Status:${NC}"
kubectl get all -n kube-credential

echo -e "\n${BLUE}To access the application:${NC}"
echo "kubectl port-forward svc/frontend 3000:80 -n kube-credential"
echo "Then open http://localhost:3000 in your browser"
