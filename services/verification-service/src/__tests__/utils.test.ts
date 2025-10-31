import { validateCredential, getWorkerId } from '../utils';

describe('Utils', () => {
  describe('validateCredential', () => {
    it('should validate a correct credential', () => {
      const credential = {
        id: 'cred-001',
        holderName: 'John Doe',
        credentialType: 'License',
        issueDate: '2025-01-01'
      };

      const result = validateCredential(credential);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject null credential', () => {
      const result = validateCredential(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Credential must be an object');
    });

    it('should reject credential without id', () => {
      const credential = {
        holderName: 'John Doe',
        credentialType: 'License',
        issueDate: '2025-01-01'
      };

      const result = validateCredential(credential);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('id');
    });

    it('should reject credential without holderName', () => {
      const credential = {
        id: 'cred-001',
        credentialType: 'License',
        issueDate: '2025-01-01'
      };

      const result = validateCredential(credential);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('holderName');
    });

    it('should reject credential without credentialType', () => {
      const credential = {
        id: 'cred-001',
        holderName: 'John Doe',
        issueDate: '2025-01-01'
      };

      const result = validateCredential(credential);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('credentialType');
    });

    it('should reject credential without issueDate', () => {
      const credential = {
        id: 'cred-001',
        holderName: 'John Doe',
        credentialType: 'License'
      };

      const result = validateCredential(credential);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('issueDate');
    });
  });

  describe('getWorkerId', () => {
    it('should return a worker ID', () => {
      const workerId = getWorkerId();
      expect(workerId).toBeDefined();
      expect(typeof workerId).toBe('string');
      expect(workerId.length).toBeGreaterThan(0);
    });
  });
});
