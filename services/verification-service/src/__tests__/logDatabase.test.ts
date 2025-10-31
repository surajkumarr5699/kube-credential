import { VerificationLogDatabase } from '../logDatabase';
import fs from 'fs';
import path from 'path';

describe('VerificationLogDatabase', () => {
  let logDb: VerificationLogDatabase;
  const testDbPath = './test-data/test-verification-logs.db';

  beforeEach(() => {
    // Clean up test database
    const dir = path.dirname(testDbPath);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
    logDb = new VerificationLogDatabase(testDbPath);
  });

  afterEach(() => {
    logDb.close();
    // Clean up test database
    const dir = path.dirname(testDbPath);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  });

  describe('logVerification', () => {
    it('should log a successful verification', () => {
      const log = logDb.logVerification(
        'cred-001',
        true,
        'Credential is valid',
        'worker-1',
        'issuance-worker-1',
        '2025-01-01T00:00:00.000Z'
      );

      expect(log.credentialId).toBe('cred-001');
      expect(log.verified).toBe(true);
      expect(log.message).toBe('Credential is valid');
      expect(log.workerId).toBe('worker-1');
      expect(log.issuedBy).toBe('issuance-worker-1');
      expect(log.issuedAt).toBe('2025-01-01T00:00:00.000Z');
      expect(log.id).toBeDefined();
      expect(log.timestamp).toBeDefined();
    });

    it('should log a failed verification', () => {
      const log = logDb.logVerification(
        'cred-002',
        false,
        'Credential not found',
        'worker-2'
      );

      expect(log.credentialId).toBe('cred-002');
      expect(log.verified).toBe(false);
      expect(log.message).toBe('Credential not found');
      expect(log.workerId).toBe('worker-2');
      expect(log.issuedBy).toBeUndefined();
      expect(log.issuedAt).toBeUndefined();
    });
  });

  describe('getLogsByCredentialId', () => {
    it('should retrieve logs for a specific credential', () => {
      logDb.logVerification('cred-003', true, 'Valid', 'worker-1');
      logDb.logVerification('cred-003', false, 'Tampered', 'worker-2');
      logDb.logVerification('cred-004', true, 'Valid', 'worker-1');

      const logs = logDb.getLogsByCredentialId('cred-003');

      expect(logs).toHaveLength(2);
      expect(logs[0].credentialId).toBe('cred-003');
      expect(logs[1].credentialId).toBe('cred-003');
    });

    it('should return empty array for credential with no logs', () => {
      const logs = logDb.getLogsByCredentialId('non-existent');
      expect(logs).toEqual([]);
    });
  });

  describe('getAllLogs', () => {
    it('should return all logs', () => {
      logDb.logVerification('cred-005', true, 'Valid', 'worker-1');
      logDb.logVerification('cred-006', false, 'Invalid', 'worker-2');
      logDb.logVerification('cred-007', true, 'Valid', 'worker-3');

      const logs = logDb.getAllLogs();

      expect(logs).toHaveLength(3);
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        logDb.logVerification(`cred-${i}`, true, 'Valid', 'worker-1');
      }

      const logs = logDb.getAllLogs(5);

      expect(logs).toHaveLength(5);
    });

    it('should return logs in descending timestamp order', () => {
      const log1 = logDb.logVerification('cred-008', true, 'Valid', 'worker-1');
      const log2 = logDb.logVerification('cred-009', true, 'Valid', 'worker-2');

      const logs = logDb.getAllLogs();

      expect(logs[0].timestamp).toBe(log2.timestamp);
      expect(logs[1].timestamp).toBe(log1.timestamp);
    });
  });

  describe('getLogStats', () => {
    it('should return correct statistics', () => {
      logDb.logVerification('cred-010', true, 'Valid', 'worker-1');
      logDb.logVerification('cred-011', true, 'Valid', 'worker-2');
      logDb.logVerification('cred-012', false, 'Invalid', 'worker-3');
      logDb.logVerification('cred-013', false, 'Not found', 'worker-4');
      logDb.logVerification('cred-014', false, 'Tampered', 'worker-5');

      const stats = logDb.getLogStats();

      expect(stats.total).toBe(5);
      expect(stats.verified).toBe(2);
      expect(stats.failed).toBe(3);
    });

    it('should return zero stats for empty database', () => {
      const stats = logDb.getLogStats();

      expect(stats.total).toBe(0);
      expect(stats.verified).toBe(0);
      expect(stats.failed).toBe(0);
    });
  });
});
