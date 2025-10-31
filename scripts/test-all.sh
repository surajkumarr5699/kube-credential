#!/bin/bash

# Test All Services Script
# This script runs all unit tests for the Kube Credential application

set -e

echo "======================================"
echo "Running Kube Credential Tests"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Test Issuance Service
echo -e "\n${BLUE}Testing Issuance Service...${NC}"
cd "$PROJECT_ROOT/services/issuance-service"
if npm test; then
    echo -e "${GREEN}✓ Issuance Service tests passed${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Issuance Service tests failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test Verification Service
echo -e "\n${BLUE}Testing Verification Service...${NC}"
cd "$PROJECT_ROOT/services/verification-service"
if npm test; then
    echo -e "${GREEN}✓ Verification Service tests passed${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Verification Service tests failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Summary
echo -e "\n======================================"
echo "Test Summary"
echo "======================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed! ✗${NC}"
    exit 1
fi
