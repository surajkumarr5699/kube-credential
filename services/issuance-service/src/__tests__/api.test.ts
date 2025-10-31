import request from 'supertest';
import { app, db } from '../index';
import { Credential } from '../types';

describe('Issuance Service API', () => {
  afterAll(() => {
    db.close();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'issuance-service');
      expect(response.body).toHaveProperty('workerId');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/issue-credential', () => {
    it('should issue a valid credential', async () => {
      const credential: Credential = {
        id: `test-cred-${Date.now()}`,
        holderName: 'Test User',
        credentialType: 'Test Certificate',
        issueDate: '2025-01-01'
      };

      const response = await request(app)
        .post('/api/issue-credential')
        .send(credential)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('worker');
      expect(response.body.credential).toEqual(credential);
      expect(response.body).toHaveProperty('workerId');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should reject duplicate credential', async () => {
      const credential: Credential = {
        id: `duplicate-cred-${Date.now()}`,
        holderName: 'Duplicate User',
        credentialType: 'Test',
        issueDate: '2025-01-01'
      };

      // Issue first time
      await request(app).post('/api/issue-credential').send(credential);

      // Try to issue again
      const response = await request(app)
        .post('/api/issue-credential')
        .send(credential);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credential already issued');
    });

    it('should reject invalid credential without id', async () => {
      const invalidCredential = {
        holderName: 'Test User',
        credentialType: 'Test',
        issueDate: '2025-01-01'
      };

      const response = await request(app)
        .post('/api/issue-credential')
        .send(invalidCredential);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('id');
    });

    it('should reject invalid credential without holderName', async () => {
      const invalidCredential = {
        id: 'test-id',
        credentialType: 'Test',
        issueDate: '2025-01-01'
      };

      const response = await request(app)
        .post('/api/issue-credential')
        .send(invalidCredential);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('holderName');
    });
  });

  describe('GET /api/credentials', () => {
    it('should return list of credentials', async () => {
      const response = await request(app).get('/api/credentials');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.credentials)).toBe(true);
    });
  });

  describe('GET /api/credentials/:id', () => {
    it('should return a specific credential', async () => {
      const credential: Credential = {
        id: `specific-cred-${Date.now()}`,
        holderName: 'Specific User',
        credentialType: 'Specific Type',
        issueDate: '2025-01-01'
      };

      // Issue credential first
      await request(app).post('/api/issue-credential').send(credential);

      // Retrieve it
      const response = await request(app).get(`/api/credentials/${credential.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.credential.id).toBe(credential.id);
    });

    it('should return 404 for non-existent credential', async () => {
      const response = await request(app).get('/api/credentials/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Credential not found');
    });
  });
});
