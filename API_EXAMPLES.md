# API Examples

This document provides practical examples for testing the Kube Credential APIs.

## Base URLs

- **Issuance Service**: `http://localhost:3001`
- **Verification Service**: `http://localhost:3002`
- **Frontend**: `http://localhost:3000`

## Issuance Service API

### 1. Health Check

**Request:**
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "issuance-service",
  "workerId": "hostname-or-pod-name",
  "timestamp": "2025-10-08T07:21:02.000Z"
}
```

### 2. Issue a Driver License

**Request:**
```bash
curl -X POST http://localhost:3001/api/issue-credential \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DL-CA-2025-001",
    "holderName": "John Doe",
    "credentialType": "Driver License",
    "issueDate": "2025-01-15",
    "expiryDate": "2030-01-15"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Credential issued by issuance-service-pod-1",
  "credential": {
    "id": "DL-CA-2025-001",
    "holderName": "John Doe",
    "credentialType": "Driver License",
    "issueDate": "2025-01-15",
    "expiryDate": "2030-01-15"
  },
  "workerId": "issuance-service-pod-1",
  "timestamp": "2025-10-08T07:21:02.000Z"
}
```

**Duplicate Error Response (409):**
```json
{
  "success": false,
  "message": "Credential already issued",
  "workerId": "issuance-service-pod-2",
  "timestamp": "2025-10-08T07:22:00.000Z"
}
```

### 3. Issue a Passport

**Request:**
```bash
curl -X POST http://localhost:3001/api/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "PP-US-2025-12345",
    "holderName": "Jane Smith",
    "credentialType": "Passport",
    "issueDate": "2025-02-01",
    "expiryDate": "2035-02-01"
  }'
```

### 5. Issue a Certificate

**Request:**
```bash
curl -X POST http://localhost:3001/api/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CERT-2025-001",
    "holderName": "Alice Brown",
    "credentialType": "Certificate",
    "issueDate": "2025-04-01",
    "expiryDate": "2028-04-01"
  }'
```

### 6. Get All Credentials

**Request:**
```bash
curl http://localhost:3001/api/credentials
```

**Response:**
```json
{
  "success": true,
  "credentials": [
    {
      "id": "DL-CA-2025-001",
      "holderName": "John Doe",
      "credentialType": "Driver License",
      "issueDate": "2025-01-15",
      "expiryDate": "2030-01-15"
    },
    {
      "id": "PP-US-2025-12345",
      "holderName": "Jane Smith",
      "credentialType": "Passport",
      "issueDate": "2025-02-01",
      "expiryDate": "2035-02-01"
    }
  ],
  "count": 2,
  "workerId": "issuance-service-pod-1",
  "timestamp": "2025-10-08T07:25:00.000Z"
}
```

### 7. Get Specific Credential

**Request:**
```bash
curl http://localhost:3001/api/credentials/DL-CA-2025-001
```

**Success Response (200):**
```json
{
  "success": true,
  "credential": {
    "id": "DL-CA-2025-001",
    "holderName": "John Doe",
    "credentialType": "Driver License",
    "issueDate": "2025-01-15",
    "expiryDate": "2030-01-15"
  },
  "workerId": "issuance-service-pod-2",
  "timestamp": "2025-10-08T07:26:00.000Z"
}
```

**Not Found Response (404):**
```json
{
  "success": false,
  "error": "Credential not found",
  "workerId": "issuance-service-pod-1",
  "timestamp": "2025-10-08T07:27:00.000Z"
}
```

### 8. Invalid Credential (Missing Required Field)

**Request:**
```bash
curl -X POST http://localhost:3001/api/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "INVALID-001",
    "credentialType": "Test"
  }'
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Credential must have a valid holderName",
  "workerId": "issuance-service-pod-1",
  "timestamp": "2025-10-08T07:28:00.000Z"
}
```

## Verification Service API

### 1. Health Check

**Request:**
```bash
curl http://localhost:3002/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "verification-service",
  "workerId": "verification-service-pod-1",
  "timestamp": "2025-10-08T07:30:00.000Z"
}
```

### 2. Verify Valid Credential

**Request:**
```bash
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "DL-CA-2025-001",
      "holderName": "John Doe",
      "credentialType": "Driver License",
      "issueDate": "2025-01-15",
      "expiryDate": "2030-01-15"
    }
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "verified": true,
  "message": "Credential is valid and has been issued",
  "credential": {
    "id": "DL-CA-2025-001",
    "holderName": "John Doe",
    "credentialType": "Driver License",
    "issueDate": "2025-01-15",
    "expiryDate": "2030-01-15"
  },
  "issuedBy": "issuance-service-pod-1",
  "issuedAt": "2025-10-08T07:21:02.000Z",
  "workerId": "verification-service-pod-1",
  "timestamp": "2025-10-08T07:31:00.000Z"
}
```

### 3. Verify Non-Existent Credential

**Request:**
```bash
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "FAKE-999",
      "holderName": "Fake Person",
      "credentialType": "Fake Type",
      "issueDate": "2025-01-01"
    }
  }'
```

**Response (200):**
```json
{
  "success": true,
  "verified": false,
  "message": "Credential not found in issuance records",
  "workerId": "verification-service-pod-2",
  "timestamp": "2025-10-08T07:32:00.000Z"
}
```

### 4. Verify with Mismatched Data

**Request:**
```bash
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "DL-CA-2025-001",
      "holderName": "Wrong Name",
      "credentialType": "Driver License",
      "issueDate": "2025-01-15"
    }
  }'
```

**Response (200):**
```json
{
  "success": true,
  "verified": false,
  "message": "Credential data does not match issued credential",
  "workerId": "verification-service-pod-1",
  "timestamp": "2025-10-08T07:33:00.000Z"
}
```

### 5. Batch Verification

**Request:**
```bash
curl -X POST http://localhost:3002/api/verify/batch \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": [
      {
        "id": "DL-CA-2025-001",
        "holderName": "John Doe",
        "credentialType": "Driver License",
        "issueDate": "2025-01-15",
        "expiryDate": "2030-01-15"
      },
      {
        "id": "PP-US-2025-12345",
        "holderName": "Jane Smith",
        "credentialType": "Passport",
        "issueDate": "2025-02-01",
        "expiryDate": "2035-02-01"
      },
      {
        "id": "FAKE-999",
        "holderName": "Fake Person",
        "credentialType": "Fake",
        "issueDate": "2025-01-01"
      }
    ]
  }'
```

**Response (200):**
```json
{
  "success": true,
  "results": [
    {
      "verified": true,
      "message": "Credential is valid and has been issued",
      "credential": { ... },
      "issuedBy": "issuance-service-pod-1",
      "issuedAt": "2025-10-08T07:21:02.000Z"
    },
    {
      "verified": true,
      "message": "Credential is valid and has been issued",
      "credential": { ... },
      "issuedBy": "issuance-service-pod-2",
      "issuedAt": "2025-10-08T07:22:30.000Z"
    },
    {
      "verified": false,
      "message": "Credential not found in issuance records"
    }
  ],
  "workerId": "verification-service-pod-1",
  "timestamp": "2025-10-08T07:35:00.000Z"
}
```

### 6. Invalid Verification Request

**Request:**
```bash
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "TEST-001"
    }
  }'
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Credential must have a valid holderName",
  "workerId": "verification-service-pod-1",
  "timestamp": "2025-10-08T07:36:00.000Z"
}
```

### 7. Get Verification Logs

Fetch recent verification logs stored by the service. Useful for debugging and observability.

**Request (local):**
```bash
curl "http://localhost:3002/api/verify/logs?limit=50"
```

**Request (Render example):**
```bash
curl "https://kube-credential-verification-service-jxhx.onrender.com/api/verify/logs?limit=50"
```

**Query Params:**
- `limit` (optional, default: 100) — maximum number of log entries to return

**Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "e4c9b0d7-5e7e-4bb6-9f37-123456789abc",
      "credentialId": "DL-CA-2025-001",
      "verified": true,
      "message": "Credential is valid and has been issued",
      "issuedBy": "issuance-service-pod-1",
      "issuedAt": "2025-10-08T07:21:02.000Z",
      "workerId": "verification-service-pod-1",
      "timestamp": "2025-10-08T07:31:00.000Z"
    }
  ],
  "stats": { "total": 42, "verified": 30, "failed": 12 },
  "workerId": "verification-service-pod-1",
  "timestamp": "2025-10-09T13:20:00.000Z"
}
```

## Verification Service Logs (Examples)

Below are example logs you might see from the verification-service when handling requests. Adjust to your logging format if different.

### Successful Verification

```text
2025-10-08T07:31:00.000Z INFO verification-service requestId=2a9f3d workerId=verification-service-pod-1
  method=POST path=/api/verify status=200 latency=46ms client=127.0.0.1:53422
  credentialId=DL-CA-2025-001 verified=true issuedBy=issuance-service-pod-1 issuedAt=2025-10-08T07:21:02.000Z
```

### Credential Not Found (verified=false)

```text
2025-10-08T07:32:00.000Z INFO verification-service requestId=53b7c1 workerId=verification-service-pod-2
  method=POST path=/api/verify status=200 latency=29ms client=127.0.0.1:53490
  credentialId=FAKE-999 verified=false message="Credential not found in issuance records"
```

### Invalid Request (400)

```text
2025-10-08T07:36:00.000Z WARN verification-service requestId=9d11aa workerId=verification-service-pod-1
  method=POST path=/api/verify status=400 latency=12ms client=127.0.0.1:53510
  error="Credential must have a valid holderName" payload={"credential":{"id":"TEST-001"}}
```

## Testing Workflow

### Complete Test Scenario

```bash
# 1. Check services are healthy
curl http://localhost:3001/health
curl http://localhost:3002/health

# 2. Issue a credential
curl -X POST http://localhost:3001/api/issue-credential \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TEST-WORKFLOW-001",
    "holderName": "Test User",
    "credentialType": "Test Certificate",
    "issueDate": "2025-10-08"
  }'

# 3. Verify the credential
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "TEST-WORKFLOW-001",
      "holderName": "Test User",
      "credentialType": "Test Certificate",
      "issueDate": "2025-10-08"
    }
  }'

# 4. Try to issue duplicate (should fail)
curl -X POST http://localhost:3001/api/issue-credential \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TEST-WORKFLOW-001",
    "holderName": "Test User",
    "credentialType": "Test Certificate",
    "issueDate": "2025-10-08"
  }'

# 5. Verify with wrong data (should fail)
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "TEST-WORKFLOW-001",
      "holderName": "Wrong Name",
      "credentialType": "Test Certificate",
      "issueDate": "2025-10-08"
    }
  }'

# 6. Get all credentials
curl http://localhost:3001/api/credentials

# 7. Get specific credential
curl http://localhost:3001/api/credentials/TEST-WORKFLOW-001
```

## Using with Postman

### Import Collection

Create a new Postman collection with the following requests:

1. **Issuance - Health Check**
   - Method: GET
   - URL: `{{issuance_url}}/health`

2. **Issuance - Issue Credential**
   - Method: POST
   - URL: `{{issuance_url}}/api/issue`
   - Body: Raw JSON (see examples above)

3. **Issuance - Get All Credentials**
   - Method: GET
   - URL: `{{issuance_url}}/api/credentials`

4. **Issuance - Get Credential by ID**
   - Method: GET
   - URL: `{{issuance_url}}/api/credentials/{{credential_id}}`

5. **Verification - Health Check**
   - Method: GET
   - URL: `{{verification_url}}/health`

6. **Verification - Verify Credential**
   - Method: POST
   - URL: `{{verification_url}}/api/verify`
   - Body: Raw JSON (see examples above)

### Environment Variables

```json
{
  "issuance_url": "http://localhost:3001",
  "verification_url": "http://localhost:3002",
  "credential_id": "DL-CA-2025-001"
}
```

## Load Testing

### Using Apache Bench

```bash
# Create test payload
cat > credential.json << EOF
{
  "id": "LOAD-TEST-001",
  "holderName": "Load Test User",
  "credentialType": "Test",
  "issueDate": "2025-10-08"
}
EOF

# Run load test
ab -n 1000 -c 10 -p credential.json -T application/json \
  http://localhost:3001/api/issue-credential
```

### Using Artillery

```yaml
# artillery-test.yml
config:
  target: "http://localhost:3001"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - post:
          url: "/api/issue-credential"
          json:
            id: "{{ $randomString() }}"
            holderName: "Test User"
            credentialType: "Test"
            issueDate: "2025-10-08"
```

Run: `artillery run artillery-test.yml`

## Notes

- Replace `localhost` with your actual host/IP when testing remotely
- For Kubernetes, use `kubectl port-forward` or the LoadBalancer IP
- Worker IDs will vary based on which pod handles the request
- Timestamps are in ISO 8601 format
- All dates should be in YYYY-MM-DD format
