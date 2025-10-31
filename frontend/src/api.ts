import axios from 'axios';
import { API_CONFIG } from './config';
import { Credential, IssuanceResponse, VerificationResponse } from './types';

export const issueCredential = async (credential: Credential): Promise<IssuanceResponse> => {
  const response = await axios.post<IssuanceResponse>(
    `${API_CONFIG.ISSUANCE_SERVICE_URL}/api/issue-credential`,
    credential
  );
  return response.data;
};

export const verifyCredential = async (credential: Credential): Promise<VerificationResponse> => {
  const response = await axios.post<VerificationResponse>(
    `${API_CONFIG.VERIFICATION_SERVICE_URL}/api/verify`,
    { credential }
  );
  return response.data;
};

export const getAllCredentials = async (): Promise<Credential[]> => {
  const response = await axios.get(
    `${API_CONFIG.ISSUANCE_SERVICE_URL}/api/credentials`
  );
  return response.data.credentials || [];
};
