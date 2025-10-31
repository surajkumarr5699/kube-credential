import axios from 'axios';
import { Credential } from './types';

export class CredentialVerifier {
  private issuanceServiceUrl: string;

  constructor(issuanceServiceUrl?: string) {
    this.issuanceServiceUrl = 
      issuanceServiceUrl || 
      process.env.ISSUANCE_SERVICE_URL || 
      'http://issuance-service:3001';
  }

  async verifyCredential(credential: Credential): Promise<{
    verified: boolean;
    message: string;
    issuedBy?: string;
    issuedAt?: string;
    credential?: Credential;
  }> {
    try {
      // Query the issuance service to check if credential exists
      const response = await axios.get(
        `${this.issuanceServiceUrl}/api/credentials/${credential.id}`,
        { timeout: 5000 }
      );

      if (response.data.success && response.data.credential) {
        const issuedCredential = response.data.credential;

        // Verify that the credential data matches
        const matches = this.compareCredentials(credential, issuedCredential);

        if (matches) {
          return {
            verified: true,
            message: 'Credential is valid and has been issued',
            issuedBy: response.data.workerId,
            issuedAt: response.data.timestamp,
            credential: issuedCredential
          };
        } else {
          return {
            verified: false,
            message: 'Credential data does not match issued credential'
          };
        }
      }

      return {
        verified: false,
        message: 'Credential not found in issuance records'
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          verified: false,
          message: 'Credential not found in issuance records'
        };
      }

      console.error('Error verifying credential:', error.message);
      throw new Error('Failed to verify credential: Unable to contact issuance service');
    }
  }

  private compareCredentials(provided: Credential, issued: Credential): boolean {
    // Compare essential fields
    if (provided.id !== issued.id) return false;
    if (provided.holderName !== issued.holderName) return false;
    if (provided.credentialType !== issued.credentialType) return false;
    if (provided.issueDate !== issued.issueDate) return false;

    // Compare optional fields if present
    if (provided.expiryDate && provided.expiryDate !== issued.expiryDate) {
      return false;
    }

    return true;
  }

  setIssuanceServiceUrl(url: string): void {
    this.issuanceServiceUrl = url;
  }
}
