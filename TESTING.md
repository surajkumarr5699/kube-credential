# Testing Guide

This document provides comprehensive testing instructions for the Kube Credential application.

## Unit Tests

### Issuance Service Tests

#### Run Tests
```bash
cd services/issuance-service
npm install
npm test
```

#### Watch Mode
```bash
npm run test:watch
```

#### Coverage Report
```bash
npm test -- --coverage
```

#### Test Files
- `src/__tests__/database.test.ts` - Database operations
- `src/__tests__/api.test.ts` - API endpoints
- `src/__tests__/utils.test.ts` - Utility functions

#### Test Coverage
- Database CRUD operations
- Credential issuance logic
- Duplicate prevention
- Input validation
- Error handling

### Verification Service Tests

#### Run Tests
```bash
cd services/verification-service
npm install
npm test
```

#### Watch Mode
```bash
npm run test:watch
```

#### Coverage Report
```bash
npm test -- --coverage
```

#### Test Files
- `src/__tests__/verifier.test.ts` - Verification logic
- `src/__tests__/api.test.ts` - API endpoints
- `src/__tests__/utils.test.ts` - Utility functions

#### Test Coverage
- Credential verification
- Service communication
- Data comparison
- Error handling
- Edge cases

### Frontend Tests

The frontend uses Vitest + Testing Library. Ensure Node 18+.

#### Install Test Dependencies (once)
```bash
cd frontend
npm i -D @testing-library/dom@^10 @testing-library/jest-dom@^6 jsdom@^24
```

#### Configure Vitest (vite.config.ts)
```ts
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
})
```

#### Setup Jest-DOM Matchers
```ts
// frontend/src/setupTests.ts
import '@testing-library/jest-dom/vitest'
```

#### Run Frontend Tests
```bash
cd frontend
nvm use 20   # or Node >= 18
npm run test
```

## Integration Tests

### Manual API Testing

#### Test Issuance Service

```bash
# Health check
curl http://localhost:3001/health

# Issue a credential
curl -X POST http://localhost:3001/api/issue-credential \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TEST-001",
    "holderName": "John Doe",
    "credentialType": "Driver License",
    "issueDate": "2025-01-01",
    "expiryDate": "2030-01-01"
  }'

# Try to issue duplicate (should fail)
curl -X POST http://localhost:3001/api/issue-credential \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TEST-001",
    "holderName": "John Doe",
    "credentialType": "Driver License",
    "issueDate": "2025-01-01"
  }'

# Get all credentials
curl http://localhost:3001/api/credentials

# Get specific credential
curl http://localhost:3001/api/credentials/TEST-001
```

#### Test Verification Service

```bash
# Health check
curl http://localhost:3002/health

# Verify valid credential
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "TEST-001",
      "holderName": "John Doe",
      "credentialType": "Driver License",
      "issueDate": "2025-01-01",
      "expiryDate": "2030-01-01"
    }
  }'

# Verify non-existent credential
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "FAKE-999",
      "holderName": "Jane Doe",
      "credentialType": "Passport",
      "issueDate": "2025-01-01"
    }
  }'

# Verify with mismatched data
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "TEST-001",
      "holderName": "Wrong Name",
      "credentialType": "Driver License",
      "issueDate": "2025-01-01"
    }
  }'
```

### Using Postman

Import the following collection:

```json
{
  "info": {
    "name": "Kube Credential API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Issuance Service",
      "item": [
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3001/health",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3001",
              "path": ["health"]
            }
          }
        },
        {
          "name": "Issue Credential",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"id\": \"CRED-2025-001\",\n  \"holderName\": \"John Doe\",\n  \"credentialType\": \"Driver License\",\n  \"issueDate\": \"2025-01-01\",\n  \"expiryDate\": \"2030-01-01\",\n  \"metadata\": {\n    \"state\": \"CA\",\n    \"class\": \"C\"\n  }\n}"
            },
            "url": {
              "raw": "http://localhost:3001/api/issue-credential",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3001",
              "path": ["api", "issue-credential"]
            }
          }
        },
        {
          "name": "Get All Credentials",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3001/api/credentials",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3001",
              "path": ["api", "credentials"]
            }
          }
        }
      ]
    },
    {
      "name": "Verification Service",
      "item": [
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3002/health",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3002",
              "path": ["health"]
            }
          }
        },
        {
          "name": "Verify Credential",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"credential\": {\n    \"id\": \"CRED-2025-001\",\n    \"holderName\": \"John Doe\",\n    \"credentialType\": \"Driver License\",\n    \"issueDate\": \"2025-01-01\",\n    \"expiryDate\": \"2030-01-01\",\n    \"metadata\": {\n      \"state\": \"CA\",\n      \"class\": \"C\"\n    }\n  }\n}"
            },
            "url": {
              "raw": "http://localhost:3002/api/verify",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3002",
              "path": ["api", "verify"]
            }
          }
        }
      ]
    }
  ]
}
```

## End-to-End Testing

### Test Scenario 1: Complete Flow

1. **Issue a Credential**
   - Navigate to http://localhost:3000/issue
   - Fill in the form with test data
   - Click "Issue Credential"
   - Verify success message shows worker ID
   - Note the credential details

2. **Verify the Credential**
   - Navigate to http://localhost:3000/verify
   - Enter the same credential details
   - Click "Verify Credential"
   - Verify success message and worker ID
   - Confirm issued by and issued at information

3. **Test Duplicate Prevention**
   - Go back to http://localhost:3000/issue
   - Try to issue the same credential again
   - Verify error message: "Credential already issued"

4. **Test Invalid Verification**
   - Navigate to http://localhost:3000/verify
   - Enter a non-existent credential ID
   - Verify failure message

### Test Scenario 2: Validation Testing

1. **Test Required Fields**
   - Try to submit form without required fields
   - Verify validation messages

### Test Scenario 3: Load Testing

#### Using Apache Bench
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test issuance endpoint
ab -n 1000 -c 10 -p credential.json -T application/json http://localhost:3001/api/issue-credential

# Test verification endpoint
ab -n 1000 -c 10 -p verify.json -T application/json http://localhost:3002/api/verify
```

#### Using Artillery
```bash
# Install Artillery
npm install -g artillery

# Create test script (artillery-test.yml)
# Run load test
artillery run artillery-test.yml
```

## Kubernetes Testing

### Test Pod Scaling

```bash
# Scale up
kubectl scale deployment issuance-service --replicas=5 -n kube-credential

# Watch pods
kubectl get pods -n kube-credential -w

# Test load distribution
for i in {1..10}; do
  curl -X POST http://<service-url>/api/issue-credential \
    -H "Content-Type: application/json" \
    -d "{\"id\":\"TEST-$i\",\"holderName\":\"User $i\",\"credentialType\":\"Test\",\"issueDate\":\"2025-01-01\"}"
done

# Check which workers handled requests
kubectl logs -l app=issuance-service -n kube-credential | grep "Worker ID"
```

### Test Health Checks

```bash
# Check liveness probes
kubectl describe pod <pod-name> -n kube-credential | grep -A 10 Liveness

# Check readiness probes
kubectl describe pod <pod-name> -n kube-credential | grep -A 10 Readiness

# Simulate pod failure
kubectl delete pod <pod-name> -n kube-credential

# Verify new pod is created
kubectl get pods -n kube-credential -w
```

### Test Service Discovery

```bash
# Create test pod
kubectl run test-pod --image=busybox -it --rm --restart=Never -n kube-credential -- sh

# Inside the pod
wget -O- http://issuance-service:3001/health
wget -O- http://verification-service:3002/health
exit
```

## Performance Testing

### Metrics to Monitor

1. **Response Time**
   - Issuance: < 100ms
   - Verification: < 200ms (includes external call)

2. **Throughput**
   - Target: 100 requests/second per pod

3. **Error Rate**
   - Target: < 0.1%

4. **Resource Usage**
   - CPU: < 80%
   - Memory: < 80%

### Monitoring Commands

```bash
# Check resource usage
kubectl top pods -n kube-credential

# Check HPA metrics
kubectl get hpa -n kube-credential

# View detailed metrics
kubectl describe hpa issuance-service-hpa -n kube-credential
```

## Test Checklist

### Functional Tests
- [ ] Issue new credential successfully
- [ ] Prevent duplicate credential issuance
- [ ] Verify valid credential
- [ ] Reject invalid credential
- [ ] Reject credential with mismatched data
- [ ] Handle missing required fields
- [ ] Display worker ID in responses

### Non-Functional Tests
- [ ] Response time within acceptable limits
- [ ] Services handle concurrent requests
- [ ] Pods restart automatically on failure
- [ ] HPA scales based on load
- [ ] Health checks work correctly
- [ ] Services communicate correctly
- [ ] Database persists data correctly
- [ ] Frontend displays errors properly

### Security Tests
- [ ] Input validation prevents injection
- [ ] CORS configured correctly
- [ ] No sensitive data in logs
- [ ] Error messages don't leak information

### Compatibility Tests
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Responsive on mobile devices
- [ ] Works with different Kubernetes versions

## Troubleshooting Tests

### If Tests Fail

1. **Check Service Status**
   ```bash
   docker-compose ps
   # or
   kubectl get pods -n kube-credential
   ```

2. **Check Logs**
   ```bash
   docker-compose logs issuance-service
   # or
   kubectl logs -l app=issuance-service -n kube-credential
   ```

3. **Verify Network Connectivity**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   ```

4. **Check Database**
   ```bash
   docker exec -it issuance-service ls -la /app/data
   # or
   kubectl exec -it <pod-name> -n kube-credential -- ls -la /app/data
   ```

5. **Restart Services**
   ```bash
   docker-compose restart
   # or
   kubectl rollout restart deployment/issuance-service -n kube-credential
   ```
