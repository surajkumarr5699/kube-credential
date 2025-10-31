import { CredentialVerifier } from '../verifier';
import { Credential } from '../types';
import nock from 'nock';

describe('CredentialVerifier', () => {
  let verifier: CredentialVerifier;
  const issuanceServiceUrl = 'http://test-issuance-service:3001';

  beforeEach(() => {
    verifier = new CredentialVerifier(issuanceServiceUrl);
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('verifyCredential', () => {
    it('should verify a valid credential', async () => {
      const credential: Credential = {
        id: 'cred-001',
        holderName: 'John Doe',
        credentialType: 'Driver License',
        issueDate: '2025-01-01'
      };

      // Mock the issuance service response
      nock(issuanceServiceUrl)
        .get('/api/credentials/cred-001')
        .reply(200, {
          success: true,
          credential: credential,
          workerId: 'worker-1',
          timestamp: '2025-01-01T00:00:00.000Z'
        });

      const result = await verifier.verifyCredential(credential);

      expect(result.verified).toBe(true);
      expect(result.message).toContain('valid');
      expect(result.issuedBy).toBe('worker-1');
      expect(result.credential).toEqual(credential);
    });

    it('should reject credential not found in issuance records', async () => {
      const credential: Credential = {
        id: 'cred-999',
        holderName: 'Jane Doe',
        credentialType: 'Passport',
        issueDate: '2025-01-01'
      };

      // Mock 404 response
      nock(issuanceServiceUrl)
        .get('/api/credentials/cred-999')
        .reply(404, {
          success: false,
          error: 'Credential not found'
        });

      const result = await verifier.verifyCredential(credential);

      expect(result.verified).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should reject credential with mismatched data', async () => {
      const providedCredential: Credential = {
        id: 'cred-002',
        holderName: 'John Doe',
        credentialType: 'Driver License',
        issueDate: '2025-01-01'
      };

      const issuedCredential: Credential = {
        id: 'cred-002',
        holderName: 'Jane Doe', // Different name
        credentialType: 'Driver License',
        issueDate: '2025-01-01'
      };

      nock(issuanceServiceUrl)
        .get('/api/credentials/cred-002')
        .reply(200, {
          success: true,
          credential: issuedCredential,
          workerId: 'worker-1',
          timestamp: '2025-01-01T00:00:00.000Z'
        });

      const result = await verifier.verifyCredential(providedCredential);

      expect(result.verified).toBe(false);
      expect(result.message).toContain('does not match');
    });

    it('should handle service unavailable error', async () => {
      const credential: Credential = {
        id: 'cred-005',
        holderName: 'Test User',
        credentialType: 'Test',
        issueDate: '2025-01-01'
      };

      nock(issuanceServiceUrl)
        .get('/api/credentials/cred-005')
        .replyWithError('Service unavailable');

      await expect(verifier.verifyCredential(credential)).rejects.toThrow(
        'Failed to verify credential'
      );
    });
  });
});
