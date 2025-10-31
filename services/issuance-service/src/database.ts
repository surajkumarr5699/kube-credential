import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Credential } from './types';

export class CredentialDatabase {
  private db: Database.Database;

  constructor(dbPath: string = './data/credentials.db') {
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
      CREATE TABLE IF NOT EXISTS credentials (
        id TEXT PRIMARY KEY,
        holderName TEXT NOT NULL,
        credentialType TEXT NOT NULL,
        issueDate TEXT NOT NULL,
        expiryDate TEXT,
        workerId TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);
  }

  public issueCredential(
    credential: Credential,
    workerId: string
  ): { success: boolean; message: string; isNew: boolean } {
    const existing = this.getCredentialById(credential.id);
    
    if (existing) {
      return {
        success: false,
        message: 'Credential already issued',
        isNew: false
      };
    }

    const stmt = this.db.prepare(`
      INSERT INTO credentials (id, holderName, credentialType, issueDate, expiryDate, workerId, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const timestamp = new Date().toISOString();
    stmt.run(
      credential.id,
      credential.holderName,
      credential.credentialType,
      credential.issueDate,
      credential.expiryDate || null,
      workerId,
      timestamp
    );

    return {
      success: true,
      message: `Credential issued by worker-${workerId}`,
      isNew: true
    };
  }

  public getCredentialById(id: string): Credential | null {
    const stmt = this.db.prepare('SELECT * FROM credentials WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      holderName: row.holderName,
      credentialType: row.credentialType,
      issueDate: row.issueDate,
      expiryDate: row.expiryDate
    };
  }

  public getAllCredentials(): Credential[] {
    const stmt = this.db.prepare('SELECT * FROM credentials');
    const rows = stmt.all() as any[];

    return rows.map(row => ({
      id: row.id,
      holderName: row.holderName,
      credentialType: row.credentialType,
      issueDate: row.issueDate,
      expiryDate: row.expiryDate
    }));
  }

  public close(): void {
    this.db.close();
  }
}
