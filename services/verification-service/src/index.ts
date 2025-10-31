import express, { Request, Response } from 'express';
import cors from 'cors';
import { CredentialVerifier } from './verifier';
import { VerificationLogDatabase } from './logDatabase';
import { getWorkerId, validateCredential } from './utils';
import { Credential, VerificationResponse, ErrorResponse, VerificationRequest } from './types';

const app = express();
const PORT = process.env.PORT || 3002;
const workerId = getWorkerId();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Initialize verifier and log database
const verifier = new CredentialVerifier();
const logDb = new VerificationLogDatabase();

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'verification-service',
    workerId,
    timestamp: new Date().toISOString()
  });
});

// Verify credential endpoint
app.post('/api/verify', async (req: Request, res: Response) => {
  try {
    const { credential }: { credential: Credential } = req.body;
    const timestamp = new Date().toISOString();

    // Validate credential structure
    const validation = validateCredential(credential);
    if (!validation.valid) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: validation.error || 'Invalid credential',
        workerId,
        timestamp
      };
      return res.status(400).json(errorResponse);
    }

    // Verify credential
    const result = await verifier.verifyCredential(credential);

    // Log verification attempt
    logDb.logVerification(
      credential.id,
      result.verified,
      result.message,
      workerId,
      result.issuedBy,
      result.issuedAt
    );

    const response: VerificationResponse = {
      success: true,
      verified: result.verified,
      message: result.message,
      credential: result.credential,
      issuedBy: result.issuedBy,
      issuedAt: result.issuedAt,
      workerId,
      timestamp
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error verifying credential:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: error.message || 'Internal server error',
      workerId,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(errorResponse);
  }
});

// Batch verify endpoint (optional, for future use)
app.post('/api/verify/batch', async (req: Request, res: Response) => {
  try {
    const { credentials }: { credentials: Credential[] } = req.body;
    const timestamp = new Date().toISOString();

    if (!Array.isArray(credentials)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Request must contain an array of credentials',
        workerId,
        timestamp
      };
      return res.status(400).json(errorResponse);
    }

    // Verify all credentials
    const results = await Promise.all(
      credentials.map(async (credential) => {
        const validation = validateCredential(credential);
        if (!validation.valid) {
          return {
            credential,
            verified: false,
            message: validation.error || 'Invalid credential'
          };
        }

        try {
          return await verifier.verifyCredential(credential);
        } catch (error: any) {
          return {
            credential,
            verified: false,
            message: error.message || 'Verification failed'
          };
        }
      })
    );

    res.json({
      success: true,
      results,
      workerId,
      timestamp
    });
  } catch (error: any) {
    console.error('Error in batch verification:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      workerId,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(errorResponse);
  }
});

// Get verification logs endpoint (optional, for debugging)
app.get('/api/verify/logs', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = logDb.getAllLogs(limit);
    const stats = logDb.getLogStats();

    res.json({
      success: true,
      logs,
      stats,
      workerId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      workerId,
      timestamp: new Date().toISOString()
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  logDb.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  logDb.close();
  process.exit(0);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Verification Service running on port ${PORT}`);
    console.log(`Worker ID: ${workerId}`);
    console.log(`Issuance Service URL: ${process.env.ISSUANCE_SERVICE_URL || 'http://issuance-service:3001'}`);
  });
}

export { app, verifier, logDb };
