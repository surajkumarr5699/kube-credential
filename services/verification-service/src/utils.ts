import os from 'os';

export function getWorkerId(): string {
  // Try to get pod name from environment (Kubernetes)
  const podName = process.env.HOSTNAME || process.env.POD_NAME;
  
  if (podName) {
    return podName;
  }
  
  // Fallback to hostname
  return os.hostname();
}

export function validateCredential(credential: any): { valid: boolean; error?: string } {
  if (!credential || typeof credential !== 'object') {
    return { valid: false, error: 'Credential must be an object' };
  }

  if (!credential.id || typeof credential.id !== 'string') {
    return { valid: false, error: 'Credential must have a valid id' };
  }

  if (!credential.holderName || typeof credential.holderName !== 'string') {
    return { valid: false, error: 'Credential must have a valid holderName' };
  }

  if (!credential.credentialType || typeof credential.credentialType !== 'string') {
    return { valid: false, error: 'Credential must have a valid credentialType' };
  }

  if (!credential.issueDate || typeof credential.issueDate !== 'string') {
    return { valid: false, error: 'Credential must have a valid issueDate' };
  }

  return { valid: true };
}
