import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export interface VerificationLog {
  id: string;
  credentialId: string;
  verified: boolean;
  message: string;
  issuedBy?: string;
  issuedAt?: string;
  workerId: string;
  timestamp: string;
}

export class VerificationLogDatabase {
  private db: Database.Database;

  constructor(dbPath: string = './data/verification-logs.db') {
    // Ensure data directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id TEXT PRIMARY KEY,
        credentialId TEXT NOT NULL,
        verified INTEGER NOT NULL,
        message TEXT NOT NULL,
        issuedBy TEXT,
        issuedAt TEXT,
        workerId TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);

    // Create index for faster lookups
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_credentialId ON verification_logs(credentialId);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON verification_logs(timestamp);
    `);
  }

  public logVerification(
    credentialId: string,
    verified: boolean,
    message: string,
    workerId: string,
    issuedBy?: string,
    issuedAt?: string
  ): VerificationLog {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO verification_logs (id, credentialId, verified, message, issuedBy, issuedAt, workerId, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      credentialId,
      verified ? 1 : 0,
      message,
      issuedBy || null,
      issuedAt || null,
      workerId,
      timestamp
    );

    return {
      id,
      credentialId,
      verified,
      message,
      issuedBy,
      issuedAt,
      workerId,
      timestamp
    };
  }

  public getLogsByCredentialId(credentialId: string): VerificationLog[] {
    const stmt = this.db.prepare('SELECT * FROM verification_logs WHERE credentialId = ? ORDER BY timestamp DESC');
    const rows = stmt.all(credentialId) as any[];

    return rows.map(row => ({
      id: row.id,
      credentialId: row.credentialId,
      verified: row.verified === 1,
      message: row.message,
      issuedBy: row.issuedBy,
      issuedAt: row.issuedAt,
      workerId: row.workerId,
      timestamp: row.timestamp
    }));
  }

  public getAllLogs(limit: number = 100): VerificationLog[] {
    const stmt = this.db.prepare('SELECT * FROM verification_logs ORDER BY timestamp DESC LIMIT ?');
    const rows = stmt.all(limit) as any[];

    return rows.map(row => ({
      id: row.id,
      credentialId: row.credentialId,
      verified: row.verified === 1,
      message: row.message,
      issuedBy: row.issuedBy,
      issuedAt: row.issuedAt,
      workerId: row.workerId,
      timestamp: row.timestamp
    }));
  }

  public getLogStats(): { total: number; verified: number; failed: number } {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN verified = 0 THEN 1 ELSE 0 END) as failed
      FROM verification_logs
    `);
    
    const result = stmt.get() as any;
    
    return {
      total: result.total || 0,
      verified: result.verified || 0,
      failed: result.failed || 0
    };
  }

  public close(): void {
    this.db.close();
  }
}
