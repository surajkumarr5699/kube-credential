import { CredentialDatabase } from '../database';
import { Credential } from '../types';
import fs from 'fs';
import path from 'path';

describe('CredentialDatabase', () => {
  let db: CredentialDatabase;
  const testDbPath = './test-data/test-credentials.db';

  beforeEach(() => {
    // Clean up test database
    const dir = path.dirname(testDbPath);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
    db = new CredentialDatabase(testDbPath);
  });

  afterEach(() => {
    db.close();
    // Clean up test database
    const dir = path.dirname(testDbPath);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  });

  describe('issueCredential', () => {
    it('should issue a new credential successfully', () => {
      const credential: Credential = {
        id: 'cred-001',
        holderName: 'John Doe',
        credentialType: 'Driver License',
        issueDate: '2025-01-01'
      };

      const result = db.issueCredential(credential, 'worker-1');

      expect(result.success).toBe(true);
      expect(result.isNew).toBe(true);
      expect(result.message).toContain('worker-1');
    });

    it('should not issue duplicate credential', () => {
      const credential: Credential = {
        id: 'cred-002',
        holderName: 'Jane Smith',
        credentialType: 'Passport',
        issueDate: '2025-01-01'
      };

      db.issueCredential(credential, 'worker-1');
      const result = db.issueCredential(credential, 'worker-2');

      expect(result.success).toBe(false);
      expect(result.isNew).toBe(false);
      expect(result.message).toBe('Credential already issued');
    });
  });

  describe('getCredentialById', () => {
    it('should retrieve an existing credential', () => {
      const credential: Credential = {
        id: 'cred-004',
        holderName: 'Alice Brown',
        credentialType: 'Certificate',
        issueDate: '2025-01-01'
      };

      db.issueCredential(credential, 'worker-1');
      const retrieved = db.getCredentialById('cred-004');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('cred-004');
      expect(retrieved?.holderName).toBe('Alice Brown');
    });

    it('should return null for non-existent credential', () => {
      const retrieved = db.getCredentialById('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('getAllCredentials', () => {
    it('should return empty array when no credentials exist', () => {
      const credentials = db.getAllCredentials();
      expect(credentials).toEqual([]);
    });

    it('should return all issued credentials', () => {
      const cred1: Credential = {
        id: 'cred-005',
        holderName: 'User 1',
        credentialType: 'Type A',
        issueDate: '2025-01-01'
      };

      const cred2: Credential = {
        id: 'cred-006',
        holderName: 'User 2',
        credentialType: 'Type B',
        issueDate: '2025-01-02'
      };

      db.issueCredential(cred1, 'worker-1');
      db.issueCredential(cred2, 'worker-2');

      const credentials = db.getAllCredentials();
      expect(credentials).toHaveLength(2);
      expect(credentials.map(c => c.id)).toContain('cred-005');
      expect(credentials.map(c => c.id)).toContain('cred-006');
    });
  });
});
