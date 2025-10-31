export interface Credential {
  id: string;
  holderName: string;
  credentialType: string;
  issueDate: string;
  expiryDate?: string;
}

export interface IssuanceResponse {
  success: boolean;
  message: string;
  credential?: Credential;
  workerId: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  workerId: string;
  timestamp: string;
}
