# Verification Service Persistence

## Overview

The verification service now maintains its own persistence layer using SQLite to log all verification attempts. This satisfies the assignment requirement that each API should maintain its own persistence layer.

## Implementation

### Database: `VerificationLogDatabase`

Located in `src/logDatabase.ts`, this module provides:

- **SQLite database** stored at `./data/verification-logs.db`
- **Automatic schema creation** on initialization
- **Indexed queries** for fast lookups by credential ID and timestamp

### Schema

```sql
CREATE TABLE verification_logs (
  id TEXT PRIMARY KEY,              -- Unique log entry ID (UUID)
  credentialId TEXT NOT NULL,       -- ID of the credential being verified
  verified INTEGER NOT NULL,        -- 1 if verified, 0 if failed
  message TEXT NOT NULL,            -- Verification result message
  issuedBy TEXT,                    -- Worker that issued the credential (if found)
  issuedAt TEXT,                    -- Timestamp when credential was issued (if found)
  workerId TEXT NOT NULL,           -- Worker that performed this verification
  timestamp TEXT NOT NULL           -- When this verification occurred
);
```

### Features

1. **Automatic Logging**: Every verification request (successful or failed) is logged to the database
2. **Query Capabilities**:
   - Get all logs for a specific credential ID
   - Get recent logs with limit
   - Get statistics (total, verified, failed counts)
3. **API Endpoint**: `GET /api/verify/logs` to retrieve logs and statistics

## API Endpoints

### Get Verification Logs

```http
GET /api/verify/logs?limit=100
```

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid-here",
      "credentialId": "cred-001",
      "verified": true,
      "message": "Credential is valid and has been issued",
      "issuedBy": "issuance-worker-1",
      "issuedAt": "2025-01-01T00:00:00.000Z",
      "workerId": "verification-worker-1",
      "timestamp": "2025-01-01T12:00:00.000Z"
    }
  ],
  "stats": {
    "total": 150,
    "verified": 120,
    "failed": 30
  },
  "workerId": "verification-worker-1",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

## Use Cases

1. **Audit Trail**: Track all verification attempts for compliance and security
2. **Analytics**: Understand verification patterns and failure rates
3. **Debugging**: Investigate why specific credentials failed verification
4. **Monitoring**: Track service health and usage patterns

## Data Persistence

- **Docker**: Volume mounted at `/app/data` (see `docker-compose.yml`)
- **Kubernetes**: PersistentVolumeClaim can be added to deployment
- **Local Development**: Data stored in `./data/verification-logs.db`

## Testing

Comprehensive tests are provided in:
- `src/__tests__/logDatabase.test.ts` - Database operations
- `src/__tests__/api.test.ts` - API endpoint integration

## Design Rationale

While the verification service could operate statelessly (as it queries the issuance service), maintaining logs provides:

1. **Independent persistence** as required by the assignment
2. **Audit capabilities** for security and compliance
3. **Performance insights** without querying the issuance service
4. **Historical data** even if credentials are later revoked or modified

This approach balances the microservice principle of independence with practical operational needs.
