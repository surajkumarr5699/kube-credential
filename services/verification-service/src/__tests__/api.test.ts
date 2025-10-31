import request from 'supertest';
import { app, verifier, logDb } from '../index';
import { Credential } from '../types';
import nock from 'nock';

describe('Verification Service API', () => {
  const issuanceServiceUrl = process.env.ISSUANCE_SERVICE_URL || 'http://issuance-service:3001';

  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'verification-service');
      expect(response.body).toHaveProperty('workerId');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/verify', () => {
    it('should verify a valid credential', async () => {
      const credential: Credential = {
        id: 'test-cred-001',
        holderName: 'Test User',
        credentialType: 'Test Certificate',
        issueDate: '2025-01-01'
      };

      nock(issuanceServiceUrl)
        .get(`/api/credentials/${credential.id}`)
        .reply(200, {
          success: true,
          credential: credential,
          workerId: 'issuance-worker-1',
          timestamp: '2025-01-01T00:00:00.000Z'
        });

      const response = await request(app)
        .post('/api/verify')
        .send({ credential })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.verified).toBe(true);
      expect(response.body.message).toContain('valid');
      expect(response.body).toHaveProperty('workerId');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.issuedBy).toBe('issuance-worker-1');
    });

    it('should reject non-existent credential', async () => {
      const credential: Credential = {
        id: 'non-existent',
        holderName: 'Test User',
        credentialType: 'Test',
        issueDate: '2025-01-01'
      };

      nock(issuanceServiceUrl)
        .get(`/api/credentials/${credential.id}`)
        .reply(404, {
          success: false,
          error: 'Credential not found'
        });

      const response = await request(app)
        .post('/api/verify')
        .send({ credential });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.verified).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should reject invalid credential without id', async () => {
      const invalidCredential = {
        holderName: 'Test User',
        credentialType: 'Test',
        issueDate: '2025-01-01'
      };

      const response = await request(app)
        .post('/api/verify')
        .send({ credential: invalidCredential });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('id');
    });

    it('should handle service errors gracefully', async () => {
      const credential: Credential = {
        id: 'test-cred-002',
        holderName: 'Test User',
        credentialType: 'Test',
        issueDate: '2025-01-01'
      };

      nock(issuanceServiceUrl)
        .get(`/api/credentials/${credential.id}`)
        .replyWithError('Network error');

      const response = await request(app)
        .post('/api/verify')
        .send({ credential });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/verify/batch', () => {
    it('should verify multiple credentials', async () => {
      const credentials: Credential[] = [
        {
          id: 'batch-cred-001',
          holderName: 'User 1',
          credentialType: 'Type A',
          issueDate: '2025-01-01'
        },
        {
          id: 'batch-cred-002',
          holderName: 'User 2',
          credentialType: 'Type B',
          issueDate: '2025-01-02'
        }
      ];

      nock(issuanceServiceUrl)
        .get('/api/credentials/batch-cred-001')
        .reply(200, {
          success: true,
          credential: credentials[0],
          workerId: 'worker-1',
          timestamp: '2025-01-01T00:00:00.000Z'
        });

      nock(issuanceServiceUrl)
        .get('/api/credentials/batch-cred-002')
        .reply(404, {
          success: false,
          error: 'Not found'
        });

      const response = await request(app)
        .post('/api/verify/batch')
        .send({ credentials });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toHaveLength(2);
      expect(response.body.results[0].verified).toBe(true);
      expect(response.body.results[1].verified).toBe(false);
    });

    it('should reject invalid batch request', async () => {
      const response = await request(app)
        .post('/api/verify/batch')
        .send({ credentials: 'not-an-array' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('array');
    });
  });

  describe('GET /api/verify/logs', () => {
    it('should return verification logs', async () => {
      // First, create some logs by verifying credentials
      const credential: Credential = {
        id: 'log-test-001',
        holderName: 'Log Test User',
        credentialType: 'Test',
        issueDate: '2025-01-01'
      };

      nock(issuanceServiceUrl)
        .get(`/api/credentials/${credential.id}`)
        .reply(200, {
          success: true,
          credential: credential,
          workerId: 'worker-1',
          timestamp: '2025-01-01T00:00:00.000Z'
        });

      // Verify to create a log entry
      await request(app)
        .post('/api/verify')
        .send({ credential });

      // Now fetch logs
      const response = await request(app).get('/api/verify/logs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('stats');
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body.logs.length).toBeGreaterThan(0);
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('verified');
      expect(response.body.stats).toHaveProperty('failed');
    });

    it('should respect limit query parameter', async () => {
      const response = await request(app).get('/api/verify/logs?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.logs.length).toBeLessThanOrEqual(5);
    });
  });
});
